import '../../styles/pages/insights.css'

export function AdminInsightsPage() {
  const departmentTrend = [
    { label: 'Operations', value: '98%', note: 'Strong punctuality and low exception volume this week.' },
    { label: 'Finance', value: '97%', note: 'Consistent clock-ins with no open correction backlog.' },
    { label: 'Field Support', value: '91%', note: 'Higher exception load from missing breaks and late returns.' },
  ]

  const workforceTrend = [
    { label: 'Week 1', value: 95, tone: 'success' },
    { label: 'Week 2', value: 93, tone: 'success' },
    { label: 'Week 3', value: 89, tone: 'warning' },
    { label: 'Week 4', value: 94, tone: 'success' },
  ] as const

  const actionQueue = [
    { title: 'Missing break logs', detail: '6 records still need supervisor validation before payroll lock.', tone: 'warning' },
    { title: 'Repeated lateness', detail: '3 employees crossed the threshold for follow-up this pay period.', tone: 'info' },
    { title: 'Pending overtime approvals', detail: '4 requests are waiting for final admin sign-off today.', tone: 'warning' },
  ] as const

  return (
    <section className="view-stack">
      <section className="insight-summary-grid">
        <article className="surface-card insight-summary-card">
          <span>Workforce attendance</span>
          <strong>95.4%</strong>
          <p>Overall scheduled attendance remained within target range.</p>
        </article>
        <article className="surface-card insight-summary-card">
          <span>Open exceptions</span>
          <strong>14</strong>
          <p>Items currently waiting for validation, approval, or correction.</p>
        </article>
        <article className="surface-card insight-summary-card">
          <span>Employees flagged</span>
          <strong>3</strong>
          <p>Repeated lateness or unresolved attendance issues this month.</p>
        </article>
        <article className="surface-card insight-summary-card">
          <span>Approved requests</span>
          <strong>11</strong>
          <p>Leave, overtime, and corrections completed this cycle.</p>
        </article>
      </section>

      <section className="surface-card insight-chart-card">
        <div className="section-header">
          <div>
            <h3>Workforce punctuality trend</h3>
            <span className="muted">Weekly punctuality performance across departments</span>
          </div>
          <span className="insight-badge">Operations view</span>
        </div>
        <div className="trend-bars">
          {workforceTrend.map((item) => (
            <div key={item.label} className="trend-bar-card">
              <div className="trend-bar-track">
                <div className={`trend-bar-fill ${item.tone}`} style={{ height: `${item.value}%` }} />
              </div>
              <strong>{item.value}%</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="insight-two-column">
        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3>Department comparison</h3>
              <span className="muted">Attendance consistency by operating unit</span>
            </div>
          </div>
          <div className="insight-list">
            {departmentTrend.map((item) => (
              <article key={item.label} className="insight-list-row">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.note}</p>
                </div>
                <span className="insight-list-value">{item.value}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3>Action queue</h3>
              <span className="muted">Operational items that need admin attention</span>
            </div>
          </div>
          <div className="insight-highlight-list">
            {actionQueue.map((item) => (
              <article key={item.title} className={`insight-highlight ${item.tone}`}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </section>
  )
}
