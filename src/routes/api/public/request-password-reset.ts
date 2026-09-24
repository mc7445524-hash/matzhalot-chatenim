import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'קול מצהלות חתנים'
const SENDER_DOMAIN = 'notify.asher-weinberger.com'
const FROM_DOMAIN = 'notify.asher-weinberger.com'
const ADMIN_EMAIL = 'aw169729@gmail.com'

function genPassword(len = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length]
  return out
}

async function enqueueTemplateEmail(params: {
  supabase: any
  templateName: string
  to: string
  data: Record<string, any>
}) {
  const { supabase, templateName, to, data } = params
  const entry = TEMPLATES[templateName]
  if (!entry) throw new Error(`Template not found: ${templateName}`)

  const element = React.createElement(entry.component, data)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof entry.subject === 'function' ? entry.subject(data) : entry.subject

  const messageId = crypto.randomUUID()
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: to,
    status: 'pending',
  })

  const { error } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: messageId,
      queued_at: new Date().toISOString(),
    },
  })
  if (error) throw new Error(`enqueue failed: ${error.message}`)
}

export const Route = createFileRoute('/api/public/request-password-reset')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ ok: false, error: 'שגיאה פנימית' }, { status: 500 })
        }

        let email: string
        try {
          const body = await request.json()
          email = String(body.email ?? '').trim()
        } catch {
          return Response.json({ ok: false, error: 'בקשה לא תקינה' }, { status: 400 })
        }
        if (!email) {
          return Response.json({ ok: false, error: 'מייל חסר' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, status, email')
          .ilike('email', email)
          .maybeSingle()

        if (pErr) {
          console.error('profile lookup failed', pErr)
          return Response.json({ ok: false, error: 'שגיאה פנימית' }, { status: 500 })
        }
        if (!profile) {
          return Response.json({ ok: false, error: 'מייל זה לא נמצא במערכת.' })
        }
        if ((profile as any).status !== 'approved') {
          return Response.json({ ok: false, error: 'החשבון אינו פעיל. פנה למנהל.' })
        }

        const tempPassword = genPassword(12)
        const { error: upErr } = await supabase.auth.admin.updateUserById(
          (profile as any).id as string,
          { password: tempPassword },
        )
        if (upErr) {
          console.error('updateUserById failed', upErr)
          return Response.json({ ok: false, error: 'שגיאה באיפוס הסיסמה' }, { status: 500 })
        }

        const userEmail = (profile as any).email as string
        const requestedAt = new Date().toLocaleString('he-IL')

        try {
          await enqueueTemplateEmail({
            supabase,
            templateName: 'password-reset-user',
            to: userEmail,
            data: { tempPassword },
          })
          await enqueueTemplateEmail({
            supabase,
            templateName: 'password-reset-admin',
            to: ADMIN_EMAIL,
            data: { userEmail, tempPassword, requestedAt },
          })
        } catch (e) {
          console.error('Failed to enqueue password reset emails', e)
          return Response.json(
            { ok: false, error: 'שליחת המייל נכשלה.' },
            { status: 500 },
          )
        }

        return Response.json({ ok: true })
      },
    },
  },
})