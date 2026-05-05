import { employeeStatuses } from '../../data'
import { EmployeeStatusRow } from '../../components/shared/EmployeeStatusRow'

export function AdminDashboardPage() {
  return (
    <section className="view-stack">
      <section className="stats-grid">
        <article className="surface-card pad-lg">
          <span>Employees active</span>
          <strong className="hero-number">14</strong>
          <p className="success-note">11 clocked in, 1 on break</p>
        </article>
        <article className="surface-card pad-lg">
          <span>Open attendance issues</span>
          <strong className="hero-number">6</strong>
          <p className="warning-note">Needs admin attention today</p>
        </article>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <h3>All employee status</h3>
          <span className="muted">Live workforce view</span>
        </div>
        <div className="employee-status-list">
          {employeeStatuses.map((employee) => (
            <EmployeeStatusRow key={employee.id} employee={employee} />
          ))}
        </div>
      </section>
    </section>
  )
}
