import AccountForm from '../components/AccountForm'

export default function Account() {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1>Account</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 18 }}>Sign in to access your saved items and account settings.</p>
      <AccountForm />
    </div>
  )
}
