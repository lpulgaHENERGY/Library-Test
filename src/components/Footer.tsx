export default function Footer() {
  return (
    <footer style={{ background: 'transparent', borderTop: '1px solid var(--color-border)', marginTop: 48 }}>
      <div className="container" style={{ padding: '24px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        <div>© {new Date().getFullYear()} My Lib. All rights reserved.</div>
      </div>
    </footer>
  );
}
