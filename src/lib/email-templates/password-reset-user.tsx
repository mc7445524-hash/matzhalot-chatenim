import React from 'react'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'קול מצהלות חתנים'

interface Props {
  tempPassword?: string
}

const PasswordResetUserEmail = ({ tempPassword }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>סיסמה זמנית למערכת {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>סיסמה זמנית למערכת {SITE_NAME}</Heading>
        <Text style={text}>
          קיבלנו בקשה לאיפוס הסיסמה שלך. הסיסמה הזמנית שלך:
        </Text>
        <Section style={codeBox}>
          <Text style={code}>{tempPassword ?? '------'}</Text>
        </Section>
        <Text style={text}>
          היכנס למערכת עם הסיסמה הזמנית, ולאחר מכן תוכל לשנות אותה לסיסמה
          חדשה דרך תפריט הפרופיל.
        </Text>
        <Text style={footer}>
          אם לא ביקשת לאפס את הסיסמה — פנה למנהל המערכת מיד.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PasswordResetUserEmail,
  subject: `סיסמה זמנית למערכת ${SITE_NAME}`,
  displayName: 'Password reset (user)',
  previewData: { tempPassword: 'Abc123XyZ789' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#111111', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#444444', lineHeight: '1.6', margin: '0 0 16px' }
const codeBox = { background: '#f3f4f6', borderRadius: '8px', padding: '14px 18px', textAlign: 'center' as const, margin: '20px 0' }
const code = { fontFamily: 'monospace', fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', color: '#111111', margin: 0, direction: 'ltr' as const }
const footer = { fontSize: '12px', color: '#888888', margin: '24px 0 0' }