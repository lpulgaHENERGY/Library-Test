import { NavLink } from 'react-router-dom';

export default function Navbar() {

  return (
    <header style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <NavLink to="/" aria-label="Home" style={{ fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', fontSize: '1.1rem' }}>My Lib</NavLink>
        <nav aria-label="Main navigation">
          <NavLink to="/catalog" activeClassName="active"> Catalog</NavLink>
          <NavLink to="/account" activeClassName="active">Account</NavLink>
          <NavLink to="/contact" activeClassName="active">Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
