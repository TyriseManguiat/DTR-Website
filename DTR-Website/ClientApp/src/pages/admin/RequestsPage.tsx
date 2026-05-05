import type { RequestItem } from '../../types'
import '../../styles/pages/requests.css'

function RequestCard({
  item,
  onOpenDetails,
}: {
  item: RequestItem
  onOpenDetails: (requestId: string) => void
}) {
  return (
    <button
      type="button"
      className="request-card"
      style={{ ['--accent' as string]: item.accent, ['--accent-soft' as string]: item.accentSoft, ['--status-soft' as string]: item.statusSoft }}
      onClick={() => onOpenDetails(item.id)}
    >
      <span className="request-strip" />
      <div className="request-body">
        <div className="request-body-main">
          <div className="request-card-topline">
            <span className="request-type-chip">{item.requestType}</span>
            {item.employeeName ? <span className="request-meta">{item.employeeName}</span> : null}
          </div>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
          <div className="request-meta-row">
            <div>
              <span>Reviewer</span>
              <strong>{item.reviewer}</strong>
            </div>
          </div>
        </div>
        <span className="status-pill" style={{ color: item.statusColor }}>
          {item.status}
        </span>
      </div>
    </button>
  )
}

export function AdminRequestsPage({ requests, onOpenDetails }: { requests: RequestItem[]; onOpenDetails: (requestId: string) => void }) {
  const pendingCount = requests.filter((request) => request.status === 'Pending').length

  return (
    <section className="view-stack">
      <section className="surface-card request-toolbar-card">
        <div className="request-toolbar">
          <div>
            <h3>Request queue</h3>
            <p className="muted">Operational review for leave, correction, and overtime requests.</p>
          </div>
          <div className="request-toolbar-meta">
            <span className="status-chip">{requests.length} total requests</span>
            <span className="status-chip online">{pendingCount} pending</span>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3>All employee requests</h3>
            <span className="muted">Admin approval queue with coverage, proof, and reviewer context</span>
          </div>
          <span className="muted">{requests.length} total</span>
        </div>
        <div className="request-list">
          {requests.map((item) => (
            <RequestCard key={item.id} item={item} onOpenDetails={onOpenDetails} />
          ))}
        </div>
      </section>
    </section>
  )
}
