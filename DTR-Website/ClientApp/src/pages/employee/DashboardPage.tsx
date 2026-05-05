import type { AppUser, TimeLog } from '../../types'
import type { DashboardState, DashboardStat } from '../../utils/dashboard'
import { CompactLogCard } from '../../components/shared/LogCards'
import '../../styles/pages/dashboard.css'

export function EmployeeDashboardPage({
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
      <section className="employee-dashboard-top">
        <div className="shift-card employee-shift-card">
          <div className="shift-card-header">
            <div className="shift-card-copy">
              <p className="employee-greeting">Good day,</p>
              <h3 className="employee-user-name">{user.name}</h3>
              <p className="shift-card-date">{dashboard.currentDate}</p>
              <div className="employee-time-block">
                <span>Current time</span>
                <strong>{dashboard.currentTime}</strong>
              </div>
            </div>
            <div className="shift-card-action">
              <button
                type="button"
                className="primary-button inverted shift-action-button"
                onClick={onClockAction}
                disabled={dashboard.clockButtonDisabled}
              >
                {dashboard.clockButtonLabel}
              </button>
            </div>
          </div>
        </div>

        <section className="surface-card employee-status-card">
          <div className="section-header">
            <div>
              <h3>Today</h3>
              <span className="muted">{dashboard.timeline.primary.title}</span>
            </div>
          </div>
          <div className="employee-status-grid">
            <article className="employee-status-metric">
              <span>Hours worked</span>
              <strong>{dashboard.hoursWorked}</strong>
              <p>{dashboard.hoursWorkedNote}</p>
            </article>
            <article className="employee-status-metric">
              <span>Punctuality</span>
              <strong>{dashboard.punctualityValue}</strong>
              <p>{dashboard.punctualityNote}</p>
            </article>
          </div>
          <div className="employee-status-note">
            <strong>{dashboard.timeline.primary.time}</strong>
            <p>{dashboard.shiftHint || dashboard.timeline.primary.detail}</p>
          </div>
        </section>
      </section>

      <section className="view-stack employee-summary-section">
        <div className="section-header">
          <h3>Monthly Summary</h3>
        </div>

        <div className="stats-grid employee-stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card employee-stat-card ${stat.tone}`}>
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
