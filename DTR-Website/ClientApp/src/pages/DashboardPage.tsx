import { employeeStatuses } from '../data'
import type { AppUser, TimeLog } from '../types'
import type { DashboardState, DashboardStat } from '../utils/dashboard'
import { EmployeeStatusRow } from '../components/shared/EmployeeStatusRow'
import { CompactLogCard } from '../components/shared/LogCards'
import '../styles/pages/dashboard.css'

export function DashboardPage({
  user,
  dashboard,
  stats,
  onClockAction,
  onOpenLogs,
  recentLogs,
}: {
  user: AppUser
  dashboard: DashboardState
  stats: DashboardStat[]
  onClockAction: () => void
  onOpenLogs: (logId?: string) => void
  recentLogs: TimeLog[]
}) {
  return (
    <section className="view-stack">
      <section className="hero-card">
        <div className="hero-top">
          <div>
            <p className="muted">Good morning,</p>
            <h3>{user.name}</h3>
          </div>
        </div>

        <div className="shift-card">
          <div className="shift-card-header">
            <div className="shift-card-copy">
              <p className="shift-card-date">{dashboard.currentDate}</p>
              <span>Current Time</span>
              <strong>{dashboard.currentTime}</strong>
            </div>
            <div className="shift-card-action">
              <button type="button" className="primary-button inverted shift-action-button" onClick={onClockAction} disabled={dashboard.clockButtonDisabled}>
                {dashboard.clockButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="view-stack">
        <div className="section-header">
          <h3>Monthly Summary</h3>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card ${stat.tone}`}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="surface-card">
        <div className="section-header">
          <h3>Recent logs</h3>
          <button type="button" className="text-button" onClick={() => onOpenLogs()}>
            View all
          </button>
        </div>
        <div className="compact-list">
          {recentLogs.slice(0, 2).map((log) => (
            <CompactLogCard key={log.id} log={log} onClick={() => onOpenLogs(log.id)} compact />
          ))}
        </div>
      </section>
    </section>
  )
}

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
