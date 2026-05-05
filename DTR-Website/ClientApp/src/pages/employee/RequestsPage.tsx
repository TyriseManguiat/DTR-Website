import { useMemo, useState } from 'react'
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

export function EmployeeRequestsPage({
  requests,
  onLeaveRequest,
  onCorrectionRequest,
  onOpenDetails,
}: {
  requests: RequestItem[]
  onLeaveRequest: () => void
  onCorrectionRequest: () => void
  onOpenDetails: (requestId: string) => void
}) {
  const [activeStatus, setActiveStatus] = useState<'All' | RequestItem['status']>('All')
  const filteredRequests = useMemo(
    () => (activeStatus === 'All' ? requests : requests.filter((request) => request.status === activeStatus)),
    [activeStatus, requests],
  )
  const pendingCount = requests.filter((request) => request.status === 'Pending').length

  return (
    <section className="view-stack">
      <section className="surface-card request-toolbar-card">
        <div className="request-toolbar">
          <div>
            <h3>Employee requests</h3>
            <p className="muted">Track submissions and review status from one queue.</p>
          </div>
          <div className="split-actions">
            <button type="button" className="primary-button" onClick={onLeaveRequest}>
              Leave Request
            </button>
            <button type="button" className="secondary-button" onClick={onCorrectionRequest}>
              Correction
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3>My requests</h3>
            <span className="muted">Submission status, review notes, and next actions</span>
          </div>
          <span className="muted">{pendingCount} pending</span>
        </div>

        <div className="request-filter-row">
          {(['All', 'Pending', 'Approved', 'Rejected', 'Needs Revision'] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={activeStatus === status ? 'request-filter active' : 'request-filter'}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="request-list">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((item) => <RequestCard key={item.id} item={item} onOpenDetails={onOpenDetails} />)
          ) : (
            <div className="request-empty-state">
              <strong>No requests in this view</strong>
              <p>Change the status filter or submit a new request.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
