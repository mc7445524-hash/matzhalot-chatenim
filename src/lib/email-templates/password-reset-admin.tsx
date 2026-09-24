import React from 'react'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'קול מצהלות חתנים'

interface Props {
  userEmail?: string
  tempPassword?: string
  requestedAt?: string
}

const PasswordResetAdminEmail = ({ userEmail, tempPassword, requestedAt }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>בקשת איפוס סיסמה: {userEmail ?? ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>בקשת איפוס סיסמה</Heading>
        <Text style={text}>
          המשתמש הבא ביקש לאפס את הסיסמה שלו במערכת {SITE_NAME}:
        </Text>
        <Section style={row}><Text style={label}>מייל:</Text><Text style={value}>{userEmail ?? ''}</Text></Section>
        <Section style={row}><Text style={label}>תאריך:</Text><Text style={value}>{requestedAt ?? ''}</Text></Section>
        <Section style={row}><Text style={label}>סיסמה זמנית:</Text><Text style={codeValue}>{tempPassword ?? ''}</Text></Section>
        <Text style={text}>הסיסמה הישנה כבר לא תקפה. הסיסמה הזמנית פעילה עד שהמשתמש או המנהל יחליפו אותה.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PasswordResetAdminEmail,
  subject: (d: Record<string, any>) => `בקשת איפוס סיסמה: ${d.userEmail ?? ''}`,
  displayName: 'Password reset (admin)',
  previewData: { userEmail: 'user@example.com', tempPassword: 'Abc123XyZ789', requestedAt: new Date().toLocaleString('he-IL') },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#111111', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
const row = { borderBottom: '1px solid #eee', padding: '8px 0', margin: 0 }
const label = { display: 'inline', fontSize: '14px', fontWeight: 'bold', color: '#111111', margin: 0 }
const value = { display: 'inline', fontSize: '14px', color: '#444444', margin: '0 0 0 8px', direction: 'ltr' as const }
const codeValue = { display: 'inline', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#111111', margin: '0 0 0 8px', direction: 'ltr' as const }