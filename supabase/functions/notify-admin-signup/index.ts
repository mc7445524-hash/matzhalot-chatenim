// Sends an email to the admin when a new user registers.
// Triggered by the client right after signUp succeeds.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ADMIN_EMAIL = "aw169729@gmail.com";
const APP_URL = "https://kol-mitzalot-chatanim.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, email } = await req.json();
    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get token created by the trigger
    const { data: tokRow } = await supabase
      .from("approval_tokens")
      .select("token")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const token = tokRow?.token;
    if (!token) {
      return new Response(JSON.stringify({ ok: true, note: "no token (admin user)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const projectRef = (Deno.env.get("SUPABASE_URL") ?? "").match(/https:\/\/([^.]+)/)?.[1];
    const fnBase = `https://${projectRef}.supabase.co/functions/v1/approve-user`;
    const approveUrl = `${fnBase}?token=${token}&action=approve`;
    const rejectUrl = `${fnBase}?token=${token}&action=reject`;

    const html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 560px; margin: auto; padding: 24px; background:#fff;">
      <h2 style="color:#111;">בקשת גישה חדשה למערכת</h2>
      <p style="color:#444;">משתמש חדש ביקש גישה לאתר <b>קול מצהלות חתנים</b>.</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>מייל:</b></td><td style="padding:8px; border-bottom:1px solid #eee;">${email}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>תאריך:</b></td><td style="padding:8px; border-bottom:1px solid #eee;">${new Date().toLocaleString("he-IL")}</td></tr>
      </table>
      <div style="margin-top:24px; text-align:center;">
        <a href="${approveUrl}" style="display:inline-block; background:#16a34a; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; margin-left:8px;">אשר גישה</a>
        <a href="${rejectUrl}" style="display:inline-block; background:#dc2626; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">דחה</a>
      </div>
      <p style="color:#888; font-size:12px; margin-top:24px;">לחיצה על אחד הקישורים תפעל מיד. הקישורים תקפים ל-30 ימים.</p>
      <p style="color:#888; font-size:12px;">אפשר גם לנהל משתמשים בתוך האתר: <a href="${APP_URL}">${APP_URL}</a></p>
    </div>`;

    // Send via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set — admin will need to approve from the UI");
      return new Response(JSON.stringify({ ok: true, emailed: false, reason: "no RESEND_API_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const emailResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Kol Mitzhalot <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `בקשת גישה חדשה: ${email}`,
        html,
      }),
    });

    if (!emailResp.ok) {
      const errText = await emailResp.text();
      console.error("Email send failed:", emailResp.status, errText);
      // Surface the failure so it shows up in logs / network panel.
      // Admin can still approve via UI in /users tab.
      return new Response(JSON.stringify({
        ok: false,
        emailed: false,
        status: emailResp.status,
        error: errText,
        hint: "Resend free tier with onboarding@resend.dev only delivers to the email address that owns the Resend account. Verify a custom domain in Resend, or set up Lovable Emails.",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, emailed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-admin-signup error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});