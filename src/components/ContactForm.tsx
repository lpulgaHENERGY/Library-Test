import React, { useState } from 'react'
import { useCreateWebMessage } from '../shared/hooks/useCreateWebMessage'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  // validationError: client-side field validation (cleared on each submit attempt)
  const [validationError, setValidationError] = useState('')

  // Hook manages submission lifecycle: anti-forgery token, retry, status, API errors.
  const { submit: sendMessage, status, error: apiError } = useCreateWebMessage()

  function validate(): boolean {
    if (!name.trim()) { setValidationError('Name is required'); return false }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setValidationError('Enter a valid email'); return false }
    if (!message.trim()) { setValidationError('Message is required'); return false }
    setValidationError('')
    return true
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!validate()) return
    sendMessage({ lpulga_name: name, lpulga_email: email, lpulga_message: message })
  }

  // Show client-side validation errors first; fall back to API error when present.
  const displayError = validationError || apiError || ''

  return (
    <form onSubmit={handleSubmit} aria-label="Contact form" style={{ maxWidth: 640 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <label htmlFor="contact-name" style={{ display: 'block', marginBottom: 6 }}>Name</label>
          <input id="contact-name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} aria-required="true" />
        </div>
        <div>
          <label htmlFor="contact-email" style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} aria-required="true" />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="contact-message" style={{ display: 'block', marginBottom: 6 }}>Message</label>
        <textarea id="contact-message" value={message} onChange={e => setMessage(e.target.value)} rows={6} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} aria-required="true" />
      </div>

      {displayError && <div role="alert" style={{ color: '#b00020', marginTop: 12 }}>{displayError}</div>}

      <div style={{ marginTop: 14, display: 'flex', gap: 12 }}>
        <button type="submit" disabled={status === 'sending'} style={{ background: 'var(--color-primary)', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none' }}>
          {status === 'sending' ? 'Sending...' : 'Send message'}
        </button>
        {status === 'sent' && <div style={{ color: 'var(--color-text-muted)', alignSelf: 'center' }}>Thanks — we'll get back to you shortly.</div>}
      </div>
    </form>
  )
}
