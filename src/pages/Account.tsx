import React from 'react';
import AccountForm from '../components/AccountForm';

const Account: React.FC = () => {
  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <section>
        <h1>Account</h1>
        <p className="text-muted" role="status">
          Sign in to access your saved items and account settings.
        </p>
      </section>
      <section>
        <AccountForm />
      </section>
    </main>
  );
};

export default Account;
