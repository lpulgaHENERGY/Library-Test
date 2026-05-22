import { useState } from 'react'

export default function AccountForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function validate() {
    if (!email) { setError('Email is required'); return false }
    if (!password) { setError('Password is required'); return false }
    // simple email check
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return false }
    setError('')
    return true
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    // Placeholder: replace with real auth integration
    console.log('Sign in attempt', { email })
    alert('Signed in (demo): ' + email)
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 420 }} aria-label="Sign in to your account">
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="email" style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)' }} aria-required="true" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="password" style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)' }} aria-required="true" />
      </div>
      {error && <div role="alert" style={{ color: '#b00020', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8 }}>Sign in</button>
        <a href="#" style={{ alignSelf: 'center', color: 'var(--color-text-muted)', textDecoration: 'none' }}>Forgot password?</a>
      </div>
    </form>
  )
}
