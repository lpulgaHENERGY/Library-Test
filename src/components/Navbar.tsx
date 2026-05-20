import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkStyle = (isActive: boolean) => ({ marginRight: 16, color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', textDecoration: 'none' });

  return (
    <header style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <NavLink to="/" aria-label="Home" style={{ fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', fontSize: '1.1rem' }}>My Lib</NavLink>
        <nav aria-label="Main navigation">
          <NavLink to="/catalog" style={({ isActive }) => linkStyle(isActive)}>Catalog</NavLink>
          <NavLink to="/account" style={({ isActive }) => linkStyle(isActive)}>Account</NavLink>
          <NavLink to="/contact" style={({ isActive }) => linkStyle(isActive)}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
