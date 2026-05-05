import { useMemo, useState } from 'react'
import type { RequestItem } from '../../types'
import '../../styles/pages/requests.css'

type AdminRequestFilter = 'all' | 'pending' | 'approved' | 'rejected'

function RequestCard({
  item,
  onOpenDetails,
}: {
  item: RequestItem
  onOpenDetails: (requestId: string) => void
}) {
  const titleLabel = item.employeeName ?? item.title
  const secondaryLabel = item.employeeName ? `${item.title} • ${item.department}` : item.department ?? item.title

  return (
    <button
      type="button"
      className="request-card admin-request-card"
      style={{ ['--accent' as string]: item.accent, ['--accent-soft' as string]: item.accentSoft, ['--status-soft' as string]: item.statusSoft }}
      onClick={() => onOpenDetails(item.id)}
    >
      <span className="request-strip" />
      <div className="request-body admin-request-body">
        <div className="request-body-main">
          <div className="request-card-topline">
            <span className="request-type-chip">{item.requestType}</span>
            <span className="request-meta">{item.effectiveLabel}</span>
          </div>
          <strong>{titleLabel}</strong>
          <p>{secondaryLabel}</p>
          <div className="request-meta-row admin-request-meta-row">
            <div>
              <span>Reviewer</span>
              <strong>{item.reviewer}</strong>
            </div>
            <div>
              <span>Submitted</span>
              <strong>{item.submittedAt}</strong>
            </div>
          </div>
        </div>

        <div className="admin-request-side">
          <span className="status-pill" style={{ color: item.statusColor }}>
            {item.status}
          </span>
          <span className="admin-request-review-link">View details</span>
        </div>
      </div>
    </button>
  )
}

export function AdminRequestsPage({
  requests,
  onOpenDetails,
}: {
  requests: RequestItem[]
  onOpenDetails: (requestId: string) => void
}) {
  const [activeFilter, setActiveFilter] = useState<AdminRequestFilter>('all')

  const filteredRequests = useMemo(() => {
    switch (activeFilter) {
      case 'pending':
        return requests.filter((request) => request.status === 'Pending')
      case 'approved':
        return requests.filter((request) => request.status === 'Approved')
      case 'rejected':
        return requests.filter((request) => request.status === 'Rejected')
      default:
        return requests
    }
  }, [activeFilter, requests])

  const pendingCount = requests.filter((request) => request.status === 'Pending').length
  const approvedCount = requests.filter((request) => request.status === 'Approved').length
  const rejectedCount = requests.filter((request) => request.status === 'Rejected').length

  const summaryCards = [
    { label: 'Pending', value: pendingCount, tone: 'pending' },
    { label: 'Approved', value: approvedCount, tone: 'approved' },
    { label: 'Rejected', value: rejectedCount, tone: 'rejected' },
  ] as const

  return (
    <section className="view-stack">
      <section className="surface-card request-toolbar-card admin-request-overview">
        <div className="request-toolbar">
          <div>
            <h3>Approval queue</h3>
            <p className="muted">Review leave, correction, and overtime requests and decide their final status.</p>
          </div>
          <div className="request-toolbar-meta">
            <span className="status-chip">{requests.length} total requests</span>
            <span className="status-chip online">{pendingCount} pending</span>
          </div>
        </div>

        <div className="admin-request-summary-grid">
          {summaryCards.map((item) => (
            <article key={item.label} className={`admin-request-summary-card ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3>Requests</h3>
            <span className="muted">Use the filters and action buttons to process employee submissions.</span>
          </div>
          <span className="muted">{filteredRequests.length} shown</span>
        </div>

        <div className="request-filter-row">
          <button type="button" className={activeFilter === 'all' ? 'request-filter active' : 'request-filter'} onClick={() => setActiveFilter('all')}>
            All
          </button>
          <button
            type="button"
            className={activeFilter === 'pending' ? 'request-filter active' : 'request-filter'}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button>
          <button
            type="button"
            className={activeFilter === 'approved' ? 'request-filter active' : 'request-filter'}
            onClick={() => setActiveFilter('approved')}
          >
            Approved
          </button>
          <button
            type="button"
            className={activeFilter === 'rejected' ? 'request-filter active' : 'request-filter'}
            onClick={() => setActiveFilter('rejected')}
          >
            Rejected
          </button>
        </div>

        <div className="request-list">
          {filteredRequests.map((item) => (
            <RequestCard key={item.id} item={item} onOpenDetails={onOpenDetails} />
          ))}
        </div>
      </section>
    </section>
  )
}
