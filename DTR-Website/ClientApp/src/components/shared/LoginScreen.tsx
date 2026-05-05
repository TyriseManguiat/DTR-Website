import type { FormEvent } from 'react'
import { Field } from '../forms/Field'
import '../../styles/auth/login-screen.css'

export function LoginScreen({
  error,
  onLogin,
}: {
  error: string | null
  onLogin: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="login-shell">
      <section className="login-card">
        <div className="brand-mark">DTR</div>
        <div className="login-copy">
          <h1>Sign in</h1>
          <p>Access is based on the signed-in account. Admin users get company-wide dashboard, logs, and requests.</p>
        </div>

        <form className="form-stack" onSubmit={onLogin}>
          <Field label="Email">
            <input type="email" name="email" defaultValue="andrea.rivera@company.com" />
          </Field>
          <Field label="Password">
            <input type="password" name="password" defaultValue="admin123" />
          </Field>
          {error ? <p className="form-message error-text">{error}</p> : null}
          <button type="submit" className="primary-button">
            Sign in
          </button>
        </form>

        <div className="demo-accounts">
          <strong>Demo accounts</strong>
          <p>`andrea.rivera@company.com` / `admin123`</p>
          <p>`tai.manguiat@company.com` / `employee123`</p>
        </div>
      </section>
    </div>
  )
}
