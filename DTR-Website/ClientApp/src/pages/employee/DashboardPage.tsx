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
