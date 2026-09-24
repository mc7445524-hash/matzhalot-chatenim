// Generates a temporary password for an approved user and queues the email
// through the project's verified Lovable email infrastructure.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ADMIN_EMAIL = "aw169729@gmail.com";
const SITE_NAME = "קול מצהלות חתנים";
const SENDER_DOMAIN = "notify.asher-weinberger.com";
const FROM_DOMAIN = "notify.asher-weinberger.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function genPassword(len = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function getUnsubscribeToken(supabase: ReturnType<typeof createClient>, email: string) {
  const normalizedEmail = email.toLowerCase();
  const { data: existing, error: lookupError } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (lookupError) throw new Error(`unsubscribe token lookup failed: ${lookupError.message}`);
  if (existing && !existing.used_at) return existing.token as string;

  const token = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
  const { error: upsertError } = await supabase
    .from("email_unsubscribe_tokens")
    .upsert({ token, email: normalizedEmail }, { onConflict: "email", ignoreDuplicates: true });
  if (upsertError) throw new Error(`unsubscribe token upsert failed: ${upsertError.message}`);

  const { data: stored, error: readBackError } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (readBackError || !stored?.token) throw new Error("unsubscribe token read-back failed");
  return stored.token as string;
}

async function enqueueEmail(
  supabase: ReturnType<typeof createClient>,
  templateName: string,
  to: string,
  subject: string,
  html: string,
  text: string,
) {
  const messageId = crypto.randomUUID();
  const unsubscribeToken = await getUnsubscribeToken(supabase, to);

  const { error: logError } = await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: to,
    status: "pending",
  });
  if (logError) throw new Error(`email log failed: ${logError.message}`);

  const { error: queueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: templateName,
      idempotency_key: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
  if (queueError) throw new Error(`enqueue failed: ${queueError.message}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "מייל חסר" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find approved profile by email
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, status, email")
      .ilike("email", email.trim())
      .maybeSingle();

    if (pErr) {
      console.error("profile lookup failed", pErr);
      return new Response(JSON.stringify({ ok: false, error: "שגיאה פנימית" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      // Do not leak existence — but we want to inform the user clearly.
      return new Response(JSON.stringify({ ok: false, error: "מייל זה לא נמצא במערכת." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.status !== "approved") {
      return new Response(JSON.stringify({ ok: false, error: "החשבון אינו פעיל. פנה למנהל." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tempPassword = genPassword(12);

    const { error: upErr } = await supabase.auth.admin.updateUserById(profile.id, {
      password: tempPassword,
    });
    if (upErr) {
      console.error("updateUserById failed", upErr);
      return new Response(JSON.stringify({ ok: false, error: "שגיאה באיפוס הסיסמה" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestedAt = new Date().toLocaleString("he-IL");
    const adminHtml = `
    <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 560px; margin: auto; padding: 24px; background:#fff;">
      <h2 style="color:#111;">בקשת איפוס סיסמה</h2>
      <p style="color:#444;">המשתמש הבא ביקש לאפס את הסיסמה שלו במערכת <b>קול מצהלות חתנים</b>:</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>מייל:</b></td><td style="padding:8px; border-bottom:1px solid #eee;" dir="ltr">${profile.email}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>תאריך:</b></td><td style="padding:8px; border-bottom:1px solid #eee;">${requestedAt}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>סיסמה זמנית:</b></td>
            <td style="padding:8px; border-bottom:1px solid #eee; font-family:monospace; font-size:18px; font-weight:bold; color:#111;" dir="ltr">${tempPassword}</td></tr>
      </table>
      <p style="color:#888; font-size:12px; margin-top:24px;">הסיסמה הישנה כבר לא תקפה. הסיסמה הזמנית פעילה עד שהמשתמש או המנהל יחליפו אותה.</p>
    </div>`;

    // User-facing email (the actual person resetting their password)
    const userHtml = `
    <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 560px; margin: auto; padding: 24px; background:#fff;">
      <h2 style="color:#111;">סיסמה זמנית למערכת קול מצהלות חתנים</h2>
      <p style="color:#444;">קיבלנו בקשה לאיפוס הסיסמה שלך. הסיסמה הזמנית שלך:</p>
      <div style="font-family:monospace; font-size:22px; font-weight:bold; padding:12px 18px; background:#f3f4f6; border-radius:8px; text-align:center; letter-spacing:2px;" dir="ltr">${tempPassword}</div>
      <p style="color:#444; margin-top:16px;">היכנס למערכת עם הסיסמה הזמנית הזו, ולאחר מכן תוכל לשנות אותה לסיסמה חדשה דרך תפריט הפרופיל.</p>
      <p style="color:#888; font-size:12px; margin-top:24px;">אם לא ביקשת לאפס את הסיסמה — פנה למנהל המערכת מיד.</p>
    </div>`;

    try {
      await enqueueEmail(
        supabase,
        "password-reset-user",
        profile.email,
        "סיסמה זמנית למערכת קול מצהלות חתנים",
        userHtml,
        `סיסמה זמנית למערכת קול מצהלות חתנים\n\n${tempPassword}`,
      );
      await enqueueEmail(
        supabase,
        "password-reset-admin",
        ADMIN_EMAIL,
        `בקשת איפוס סיסמה: ${profile.email}`,
        adminHtml,
        `בקשת איפוס סיסמה\nמייל: ${profile.email}\nתאריך: ${requestedAt}\nסיסמה זמנית: ${tempPassword}`,
      );
    } catch (emailError) {
      console.error("Failed to queue password reset emails", emailError);
      return new Response(JSON.stringify({ ok: false, error: "שליחת המייל נכשלה." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("request-password-reset error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
