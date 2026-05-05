import type { RequestItem } from '../../types'
import '../../styles/components/modals.css'

export function RequestDetailsModal({
  request,
  onApprove,
  onReject,
}: {
  request: RequestItem
  onApprove?: () => void
  onReject?: () => void
}) {
  const priorityDetail = request.details.find((detail) => detail.emphasis) ?? null
  const standardDetails = request.details.filter((detail) => !detail.emphasis)

  return (
    <div className="modal-content request-detail-modal">
      <div className="modal-header">
        <div>
          <h3>{request.title}</h3>
          <p>{request.summary}</p>
        </div>
      </div>

      <section className="status-card request-detail-hero" style={{ backgroundColor: request.accentSoft }}>
        <div className="request-status-topline">
          <span>{request.requestType} request</span>
          <strong style={{ color: request.statusColor }}>{request.status}</strong>
        </div>
        <div className="request-overview-grid">
          <div>
            <span>Reviewer</span>
            <strong>{request.reviewer}</strong>
          </div>
          <div>
            <span>Submitted</span>
            <strong>{request.submittedAt}</strong>
          </div>
          <div>
            <span>Effective</span>
            <strong>{request.effectiveLabel}</strong>
          </div>
          <div>
            <span>Last updated</span>
            <strong>{request.lastUpdated}</strong>
          </div>
        </div>
      </section>

      {priorityDetail ? (
        <section className="surface-card nested request-detail-focus">
          <span>{priorityDetail.label}</span>
          <p>{priorityDetail.value}</p>
        </section>
      ) : null}

      <section className="request-detail-grid">
        <section className="surface-card nested">
          <div className="section-header">
            <h3>Details</h3>
          </div>
          <div className="request-detail-list">
            {standardDetails.map((detail) => (
              <div key={detail.label} className="detail-row">
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card nested">
          <div className="section-header">
            <h3>Review</h3>
          </div>
          <div className="request-review-stack">
            <div className="detail-row">
              <span>Reviewer note</span>
              <strong>{request.reviewerComment}</strong>
            </div>
            {request.sourceProof ? (
              <div className="detail-row">
                <span>Proof / source</span>
                <strong>{request.sourceProof}</strong>
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <section className="surface-card nested">
        <div className="section-header">
          <h3>Action timeline</h3>
        </div>
        <div className="request-timeline">
          {request.timeline.map((entry) => (
            <div key={`${entry.label}-${entry.value}`} className="request-timeline-item">
              <div>
                <strong>{entry.label}</strong>
                <p>{entry.note}</p>
              </div>
              <time>{entry.value}</time>
            </div>
          ))}
        </div>
      </section>

      {(onApprove || onReject) && (
        <section className="request-modal-actions">
          <button type="button" className="secondary-button request-modal-button reject" onClick={onReject} disabled={request.status === 'Rejected'}>
            Reject request
          </button>
          <button type="button" className="primary-button request-modal-button approve" onClick={onApprove} disabled={request.status === 'Approved'}>
            Approve request
          </button>
        </section>
      )}
    </div>
  )
}
