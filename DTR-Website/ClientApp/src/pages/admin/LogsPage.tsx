import type { TimeLog } from '../../types'

export function AdminLogsPage({ logs }: { logs: TimeLog[] }) {
  return (
    <section className="view-stack">
      <section className="surface-card">
        <div className="section-header">
          <h3>All employee logs</h3>
          <span className="muted">Admin log monitor</span>
        </div>
        <div className="employee-status-list">
          {logs.map((log) => (
            <article key={log.id} className="employee-status-row">
              <div>
                <strong>{log.employeeName}</strong>
                <p>
                  {log.department} • {log.dateTitle}
                </p>
              </div>
              <p>{log.summary}</p>
              <span className="status-pill employee" style={{ color: log.accent, backgroundColor: log.accentSoft }}>
                {log.duration}
              </span>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
