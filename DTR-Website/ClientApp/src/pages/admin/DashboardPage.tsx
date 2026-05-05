import { CompactLogCard } from '../../components/shared/LogCards'
import { EmployeeStatusRow } from '../../components/shared/EmployeeStatusRow'
import '../../styles/pages/dashboard.css'
import type { AppUser, EmployeeStatus, RequestItem, TimeLog } from '../../types'

const queueColors = {
  warning: '#d97706',
  danger: '#dc2626',
  success: '#17835f',
} as const

export function AdminDashboardPage({
  user,
  currentDate,
  logs,
  requests,
  statuses,
  onOpenLogs,
}: {
  user: AppUser
  currentDate: string
  logs: TimeLog[]
  requests: RequestItem[]
  statuses: EmployeeStatus[]
  onOpenLogs: () => void
}) {
  const activeEmployees = statuses.filter((item) => item.status === 'Clocked In' || item.status === 'On Break').length
  const lateCount = statuses.filter((item) => item.status === 'Late').length
  const clockedOutCount = statuses.filter((item) => item.status === 'Clocked Out').length
  const pendingRequests = requests.filter((item) => item.status === 'Pending').length
  const correctionRequests = requests.filter((item) => item.requestType === 'Correction').length
  const queueItems = [
    {
      title: 'Pending approvals',
      text: `${pendingRequests} request${pendingRequests === 1 ? '' : 's'} waiting for final review`,
      count: String(pendingRequests),
      color: queueColors.warning,
    },
    {
      title: 'Late arrivals',
      text: `${lateCount} employee${lateCount === 1 ? '' : 's'} flagged for attendance follow-up`,
      count: String(lateCount),
      color: queueColors.danger,
    },
    {
      title: 'Completed shifts',
      text: `${clockedOutCount} employee${clockedOutCount === 1 ? '' : 's'} already closed for the day`,
      count: String(clockedOutCount),
      color: queueColors.success,
    },
  ] as const

  const adminHeroMetrics = [
    { label: 'Live attendance', value: `${activeEmployees}/${statuses.length}` },
    { label: 'Pending approvals', value: String(pendingRequests) },
    { label: 'Open flags', value: String(lateCount + correctionRequests) },
  ] as const

  const statusSummary = [
    { label: 'Active', value: String(activeEmployees), tone: 'success' },
    { label: 'Late', value: String(lateCount), tone: 'danger' },
    { label: 'Out', value: String(clockedOutCount), tone: 'neutral' },
  ] as const

  return (
    <section className="view-stack">
      <section className="hero-card">
        <div className="shift-card admin-command-card">
          <div className="shift-card-header admin-command-header">
            <div className="shift-card-copy">
              <p className="admin-greeting">Good day,</p>
              <strong className="admin-user-name">{user.name}</strong>
              <div className="admin-date-row">
                <span className="admin-date-dot" aria-hidden="true" />
                <p className="shift-card-date">{currentDate}</p>
              </div>
            </div>

            <div className="admin-hero-panel">
              {adminHeroMetrics.map((item) => (
                <div key={item.label} className="admin-hero-metric">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-grid">
        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3>Needs action</h3>
              <span className="muted">Operational items requiring review today</span>
            </div>
          </div>
          <div className="queue-list admin-queue-list">
            {queueItems.map((item) => (
              <article key={item.title} className="admin-queue-card">
                <span className="admin-queue-bar" style={{ backgroundColor: item.color }} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
                <span className="admin-queue-count" style={{ color: item.color, backgroundColor: `${item.color}18` }}>
                  {item.count}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3>Latest activity</h3>
              <span className="muted">Most recent attendance records across the team</span>
            </div>
            <button type="button" className="text-button" onClick={onOpenLogs}>
              View all
            </button>
          </div>
          <div className="compact-list">
            {logs.slice(0, 3).map((log) => (
              <CompactLogCard key={log.id} log={log} compact />
            ))}
          </div>
        </section>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3>Team attendance</h3>
            <span className="muted">Current shift visibility by employee</span>
          </div>
          <span className="status-chip">{statuses.length} employees tracked</span>
        </div>
        <div className="admin-status-summary">
          {statusSummary.map((item) => (
            <div key={item.label} className={`admin-status-chip ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="employee-status-list">
          {statuses.map((employee) => (
            <EmployeeStatusRow key={employee.id} employee={employee} />
          ))}
        </div>
      </section>
    </section>
  )
}
