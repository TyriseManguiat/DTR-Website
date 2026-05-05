import type { AppUser } from '../../types'
import { MetricRow } from '../shared/MetricRow'
import '../../styles/components/modals.css'

export function AccountModal({ user }: { user: AppUser }) {
  return (
    <div className="modal-content">
      <div className="modal-header">
        <div>
          <h3>Account details</h3>
          <p>Profile and work information</p>
        </div>
      </div>

      <section className="account-hero">
        <div className="account-avatar">{user.initials}</div>
        <div>
          <h4>{user.name}</h4>
          <span className="id-badge">Employee ID: {user.employeeId}</span>
        </div>
      </section>

      <section className="surface-card nested">
        <div className="section-header">
          <h3>Profile</h3>
        </div>
        <div className="metric-list">
          <MetricRow title="Department" description="" value={user.department} accent="plain" />
          <MetricRow title="Position" description="" value={user.position} accent="plain" />
          <MetricRow title="Email" description="" value={user.email} accent="plain" />
          <MetricRow title="Mobile" description="" value={user.mobile} accent="plain" />
        </div>
      </section>

      <section className="surface-card nested">
        <div className="section-header">
          <h3>Work details</h3>
        </div>
        <div className="metric-list">
          <MetricRow title="Shift schedule" description="" value={user.shiftSchedule} accent="info" />
          <MetricRow title="Reporting manager" description="" value={user.manager} accent="plain" />
          <MetricRow title="Office location" description="" value={user.location} accent="plain" />
        </div>
      </section>
    </div>
  )
}
