// Public endpoint: admin clicks a link in the email to approve/reject a user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

function htmlPage(title: string, body: string, color = "#16a34a") {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:40px;display:flex;justify-content:center}
    .card{background:#fff;border-radius:12px;padding:32px;max-width:480px;box-shadow:0 4px 16px rgba(0,0,0,.08);text-align:center}
    h1{color:${color};margin:0 0 12px}p{color:#444;line-height:1.6}</style></head>
    <body><div class="card"><h1>${title}</h1>${body}</div></body></html>`;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    if (!token || !action || !["approve", "reject"].includes(action)) {
      return new Response(htmlPage("בקשה לא תקינה", "<p>חסר טוקן או פעולה.</p>", "#dc2626"), {
        status: 400, headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tokRow } = await supabase
      .from("approval_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!tokRow) {
      return new Response(htmlPage("הקישור לא תקף", "<p>הקישור כבר נוצל או לא קיים.</p>", "#dc2626"), {
        status: 410, headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (new Date(tokRow.expires_at) < new Date()) {
      await supabase.from("approval_tokens").delete().eq("token", token);
      return new Response(htmlPage("הקישור פג תוקף", "<p>הקישור פג תוקף. אפשר לאשר ידנית מתוך האתר.</p>", "#dc2626"), {
        status: 410, headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", tokRow.user_id);

    if (updErr) {
      console.error(updErr);
      return new Response(htmlPage("שגיאה", `<p>${updErr.message}</p>`, "#dc2626"), {
        status: 500, headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Consume token
    await supabase.from("approval_tokens").delete().eq("token", token);

    const title = action === "approve" ? "המשתמש אושר ✓" : "המשתמש נדחה";
    const color = action === "approve" ? "#16a34a" : "#dc2626";
    const body = action === "approve"
      ? "<p>המשתמש יכול כעת להיכנס לאתר עם המייל והסיסמה שלו.</p>"
      : "<p>המשתמש לא יוכל להיכנס לאתר.</p>";

    return new Response(htmlPage(title, body, color), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    console.error(e);
    return new Response(htmlPage("שגיאה", `<p>${String(e)}</p>`, "#dc2626"), {
      status: 500, headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
});