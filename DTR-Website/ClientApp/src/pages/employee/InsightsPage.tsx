import '../../styles/pages/insights.css'

export function EmployeeInsightsPage() {
  const punctualityTrend = [
    { label: 'Week 1', value: 96, tone: 'success' },
    { label: 'Week 2', value: 94, tone: 'success' },
    { label: 'Week 3', value: 91, tone: 'warning' },
    { label: 'Week 4', value: 98, tone: 'success' },
  ] as const

  const behaviorBreakdown = [
    { label: 'On-time clock-ins', value: '12', note: 'Most arrivals within the first five minutes of shift start.' },
    { label: 'Late instances', value: '2', note: 'Both late arrivals happened on field dispatch preparation days.' },
    { label: 'Overtime days', value: '3', note: 'Mostly tied to payroll close and exception validation.' },
  ]

  const exceptionItems = [
    { title: 'Pending correction request', detail: 'Missing clock-out on April 29 is still under review.', tone: 'warning' },
    { title: 'Schedule adherence', detail: 'Average daily worked hours stayed within scheduled range this month.', tone: 'success' },
    { title: 'Consistency streak', detail: 'Seven consecutive present days recorded in the current pay period.', tone: 'info' },
  ] as const

  return (
    <section className="view-stack">
      <section className="insight-summary-grid">
        <article className="surface-card insight-summary-card">
          <span>Attendance rate</span>
          <strong>96.8%</strong>
          <p>Present on 15 of 16 scheduled workdays.</p>
        </article>
        <article className="surface-card insight-summary-card">
          <span>Average clock-in</span>
          <strong>8:02 AM</strong>
          <p>Two minutes past the scheduled start on average.</p>
        </article>
        <article className="surface-card insight-summary-card">
          <span>Average hours</span>
          <strong>8h 01m</strong>
          <p>Stable daily output across the current pay period.</p>
        </article>
        <article className="surface-card insight-summary-card">
          <span>Open exceptions</span>
          <strong>1</strong>
          <p>One attendance item still needs final review.</p>
        </article>
      </section>

      <section className="surface-card insight-chart-card">
        <div className="section-header">
          <div>
            <h3>Punctuality trend</h3>
            <span className="muted">Weekly punctuality performance in the current month</span>
          </div>
          <span className="insight-badge">Monthly view</span>
        </div>
        <div className="trend-bars">
          {punctualityTrend.map((item) => (
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
              <h3>Behavior breakdown</h3>
              <span className="muted">Patterns that affect punctuality and hours worked</span>
            </div>
          </div>
          <div className="insight-list">
            {behaviorBreakdown.map((item) => (
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
              <h3>Needs attention</h3>
              <span className="muted">Exceptions and notable attendance signals</span>
            </div>
          </div>
          <div className="insight-highlight-list">
            {exceptionItems.map((item) => (
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
