import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import './App.css'
import { employeeProfile, requestItems, timeLogs } from './data'
import type { AttendanceState, ModalView, RequestItem, TabId } from './types'

const scheduledStartMinutes = 8 * 60

const initialAttendance: AttendanceState = {
  clockInTime: null,
  clockOutTime: null,
  breakStartTime: null,
  accumulatedBreakMs: 0,
  isClockedOut: false,
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [activeModal, setActiveModal] = useState<ModalView | null>(null)
  const [attendance, setAttendance] = useState<AttendanceState>(initialAttendance)
  const [showAllLogs, setShowAllLogs] = useState(false)
  const [focusedLogId, setFocusedLogId] = useState<string | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const dashboard = useMemo(() => buildDashboardState(attendance), [attendance])
  const detailRequest =
    activeModal?.type === 'request-details'
      ? requestItems.find((item) => item.id === activeModal.requestId) ?? null
      : null

  const openLogs = (logId?: string) => {
    setActiveTab('logs')
    setFocusedLogId(logId ?? null)
  }

  const handleClockAction = () => {
    const now = new Date()

    setAttendance((current) => {
      if (!current.clockInTime) {
        return {
          clockInTime: now,
          clockOutTime: null,
          breakStartTime: null,
          accumulatedBreakMs: 0,
          isClockedOut: false,
        }
      }

      if (current.isClockedOut) {
        return current
      }

      const extraBreak = current.breakStartTime ? now.getTime() - current.breakStartTime.getTime() : 0

      return {
        ...current,
        clockOutTime: now,
        breakStartTime: null,
        accumulatedBreakMs: current.accumulatedBreakMs + extraBreak,
        isClockedOut: true,
      }
    })
  }

  const handleBreakAction = () => {
    const now = new Date()

    setAttendance((current) => {
      if (!current.clockInTime || current.isClockedOut) {
        return current
      }

      if (!current.breakStartTime) {
        return {
          ...current,
          breakStartTime: now,
        }
      }

      return {
        ...current,
        breakStartTime: null,
        accumulatedBreakMs: current.accumulatedBreakMs + (now.getTime() - current.breakStartTime.getTime()),
      }
    })
  }

  const closeModal = () => {
    setActiveModal(null)
    setFormMessage(null)
  }

  const handleSubmitForm = (
    event: FormEvent<HTMLFormElement>,
    validator: (formData: FormData) => string | null,
    successMessage: string,
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const error = validator(formData)

    if (error) {
      setFormMessage(error)
      return
    }

    setFormMessage(successMessage)
    window.setTimeout(() => {
      closeModal()
    }, 900)
  }

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div>
            <div className="brand-mark">DTR</div>
            <div className="brand-copy">
              <h1>Daily Time Record</h1>
              <p>React + TypeScript web workspace based on the existing mobile app.</p>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {tabItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'nav-pill active' : 'nav-pill'}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.caption}</small>
              </button>
            ))}
          </nav>

          <section className="profile-card">
            <div className="avatar">{employeeProfile.initials}</div>
            <div>
              <h2>{employeeProfile.name}</h2>
              <p>{employeeProfile.position}</p>
            </div>
            <button type="button" className="secondary-button compact" onClick={() => setActiveModal({ type: 'account' })}>
              Account details
            </button>
          </section>
        </aside>

        <main className="workspace">
          <header className="workspace-header">
            <div>
              <p className="eyebrow">{tabItems.find((item) => item.id === activeTab)?.caption}</p>
              <h2>{tabItems.find((item) => item.id === activeTab)?.label}</h2>
            </div>
            <div className="header-actions">
              <div className="status-chip online">Online</div>
              <div className="status-chip">{employeeProfile.shiftSchedule}</div>
            </div>
          </header>

          <div className="mobile-tabs">
            {tabItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'mobile-tab active' : 'mobile-tab'}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <DashboardView
              dashboard={dashboard}
              onClockAction={handleClockAction}
              onBreakAction={handleBreakAction}
              onOpenAccount={() => setActiveModal({ type: 'account' })}
              onOpenLogs={openLogs}
            />
          )}

          {activeTab === 'logs' && (
            <LogsView
              showAllLogs={showAllLogs}
              focusedLogId={focusedLogId}
              onToggleLogs={() => setShowAllLogs((value) => !value)}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsView
              onLeaveRequest={() => setActiveModal({ type: 'leave' })}
              onCorrectionRequest={() => setActiveModal({ type: 'correction' })}
              onOpenDetails={(requestId) => setActiveModal({ type: 'request-details', requestId })}
            />
          )}

          {activeTab === 'insights' && <InsightsView />}
        </main>
      </div>

      {activeModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
              ×
            </button>

            {activeModal.type === 'account' && <AccountModal />}

            {activeModal.type === 'leave' && (
              <FormModal
                title="Leave request"
                subtitle="Submit a leave request for approval."
                message={formMessage}
                messageTone={formMessage?.includes('submitted') ? 'success' : 'error'}
                onSubmit={(event) =>
                  handleSubmitForm(
                    event,
                    (formData) => {
                      if (!formData.get('leaveType') || !formData.get('coverage') || !String(formData.get('reason') ?? '').trim()) {
                        return 'Complete the leave type, coverage, and reason.'
                      }
                      return null
                    },
                    'Leave request submitted for manager review.',
                  )
                }
                fields={
                  <>
                    <Field label="Leave type">
                      <select name="leaveType" defaultValue="Vacation leave">
                        <option>Vacation leave</option>
                        <option>Sick leave</option>
                        <option>Emergency leave</option>
                        <option>Half-day leave</option>
                      </select>
                    </Field>
                    <div className="form-grid">
                      <Field label="Start date">
                        <input type="date" name="startDate" defaultValue="2026-04-29" />
                      </Field>
                      <Field label="End date">
                        <input type="date" name="endDate" defaultValue="2026-04-30" />
                      </Field>
                    </div>
                    <Field label="Shift coverage">
                      <select name="coverage" defaultValue="No coverage needed">
                        <option>No coverage needed</option>
                        <option>Buddy coverage</option>
                        <option>Supervisor-managed coverage</option>
                      </select>
                    </Field>
                    <Field label="Reason">
                      <textarea
                        name="reason"
                        rows={7}
                        placeholder="Describe the leave request and supporting context."
                      />
                    </Field>
                  </>
                }
                onCancel={closeModal}
              />
            )}

            {activeModal.type === 'correction' && (
              <FormModal
                title="Correction request"
                subtitle="Submit a time log correction for review."
                message={formMessage}
                messageTone={formMessage?.includes('submitted') ? 'success' : 'error'}
                onSubmit={(event) =>
                  handleSubmitForm(
                    event,
                    (formData) => {
                      if (!formData.get('correctionType') || !formData.get('source') || !String(formData.get('reason') ?? '').trim()) {
                        return 'Complete the correction type, source, and reason.'
                      }
                      return null
                    },
                    'Correction request submitted for manager review.',
                  )
                }
                fields={
                  <>
                    <Field label="Date">
                      <input type="date" name="correctionDate" defaultValue="2026-04-29" />
                    </Field>
                    <Field label="Correction type">
                      <select name="correctionType" defaultValue="Missing clock-out">
                        <option>Missing clock-in</option>
                        <option>Missing clock-out</option>
                        <option>Break adjustment</option>
                        <option>Wrong schedule entry</option>
                      </select>
                    </Field>
                    <div className="form-grid">
                      <Field label="Expected time">
                        <input type="time" name="expectedTime" defaultValue="17:03" />
                      </Field>
                      <Field label="Source">
                        <select name="source" defaultValue="Biometric log">
                          <option>Biometric log</option>
                          <option>Supervisor confirmation</option>
                          <option>Manual entry</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Reason">
                      <textarea
                        name="reason"
                        rows={7}
                        placeholder="Describe what should be corrected and why."
                      />
                    </Field>
                  </>
                }
                onCancel={closeModal}
              />
            )}

            {detailRequest && <RequestDetailsModal request={detailRequest} />}
          </div>
        </div>
      )}
    </>
  )
}

function DashboardView({
  dashboard,
  onClockAction,
  onBreakAction,
  onOpenAccount,
  onOpenLogs,
}: {
  dashboard: ReturnType<typeof buildDashboardState>
  onClockAction: () => void
  onBreakAction: () => void
  onOpenAccount: () => void
  onOpenLogs: (logId?: string) => void
}) {
  return (
    <section className="view-stack">
      <section className="hero-card">
        <div className="hero-top">
          <div>
            <p className="muted">Good morning,</p>
            <h3>{employeeProfile.name}</h3>
          </div>
          <button type="button" className="avatar-button" onClick={onOpenAccount}>
            <span>{employeeProfile.initials}</span>
            <i />
          </button>
        </div>

        <div className="shift-card">
          <p>{dashboard.currentDate}</p>
          <div>
            <span>Current shift</span>
            <strong>{employeeProfile.shiftSchedule}</strong>
            <p>{dashboard.shiftHint}</p>
          </div>
          <div className="action-row">
            <button type="button" className="primary-button inverted" onClick={onClockAction} disabled={dashboard.clockButtonDisabled}>
              {dashboard.clockButtonLabel}
            </button>
            <button type="button" className="primary-button muted" onClick={onBreakAction} disabled={dashboard.breakButtonDisabled}>
              {dashboard.breakButtonLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card success">
          <span>Hours worked</span>
          <strong>{dashboard.hoursWorked}</strong>
          <p>{dashboard.hoursWorkedNote}</p>
        </article>
        <article className="stat-card info">
          <span>Punctuality</span>
          <strong>{dashboard.punctualityValue}</strong>
          <p>{dashboard.punctualityNote}</p>
        </article>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <h3>Shift timeline</h3>
        </div>
        <div className="timeline">
          <TimelineItem
            color={dashboard.timeline.primary.color}
            title={dashboard.timeline.primary.title}
            detail={dashboard.timeline.primary.detail}
            time={dashboard.timeline.primary.time}
          />
          <TimelineItem
            color={dashboard.timeline.secondary.color}
            title={dashboard.timeline.secondary.title}
            detail={dashboard.timeline.secondary.detail}
            time={dashboard.timeline.secondary.time}
          />
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
          <CompactLogCard log={timeLogs[0]} onClick={() => onOpenLogs('apr28')} compact />
          <CompactLogCard log={timeLogs[1]} onClick={() => onOpenLogs('apr27')} compact />
        </div>
      </section>
    </section>
  )
}

function LogsView({
  showAllLogs,
  focusedLogId,
  onToggleLogs,
}: {
  showAllLogs: boolean
  focusedLogId: string | null
  onToggleLogs: () => void
}) {
  return (
    <section className="view-stack">
      <section className="surface-card">
        <div className="period-grid">
          <div>
            <span className="eyebrow">Current pay period</span>
            <h3>April 16 - April 30</h3>
          </div>
          <div className="period-stats">
            <div>
              <span>Worked</span>
              <strong>72h 14m</strong>
              <small>Total hours</small>
            </div>
            <div>
              <span>Late</span>
              <strong className="warning-text">18m</strong>
              <small className="warning-text">Total late</small>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <h3>Recent entries</h3>
          <button type="button" className="text-button" onClick={onToggleLogs}>
            {showAllLogs ? 'View less' : 'View all'}
          </button>
        </div>
        <div className="entry-list">
          {timeLogs.slice(0, 3).map((log) => (
            <LogCard key={log.id} log={log} focused={focusedLogId === log.id} />
          ))}
          {showAllLogs &&
            timeLogs.slice(3).map((log) => (
              <LogCard key={log.id} log={log} focused={focusedLogId === log.id} />
            ))}
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card success outlined">
          <span>Overtime</span>
          <strong>05h 20m</strong>
          <p>Awaiting payroll lock</p>
        </article>
        <article className="stat-card warning outlined">
          <span>Undertime</span>
          <strong>00h 40m</strong>
          <p>1 flagged entry</p>
        </article>
      </section>
    </section>
  )
}

function RequestsView({
  onLeaveRequest,
  onCorrectionRequest,
  onOpenDetails,
}: {
  onLeaveRequest: () => void
  onCorrectionRequest: () => void
  onOpenDetails: (requestId: string) => void
}) {
  return (
    <section className="view-stack">
      <div className="split-actions">
        <button type="button" className="primary-button" onClick={onLeaveRequest}>
          Leave Request
        </button>
        <button type="button" className="secondary-button" onClick={onCorrectionRequest}>
          Correction
        </button>
      </div>

      <section className="surface-card">
        <div className="section-header">
          <h3>Open items</h3>
          <span className="muted">View all</span>
        </div>
        <div className="request-list">
          {requestItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="request-card"
              style={{ ['--accent' as string]: item.accent, ['--accent-soft' as string]: item.accentSoft, ['--status-soft' as string]: item.statusSoft }}
              onClick={() => onOpenDetails(item.id)}
            >
              <span className="request-strip" />
              <div className="request-body">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                <span className="status-pill" style={{ color: item.statusColor }}>
                  {item.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <h3>Balances</h3>
        </div>
        <div className="metric-list">
          <MetricRow title="Vacation leave" description="Available credits for scheduled leave." value="8.5 days" accent="info" />
          <MetricRow title="Sick leave" description="Available credits for medical absences." value="5.0 days" accent="success" />
        </div>
      </section>
    </section>
  )
}

function InsightsView() {
  return (
    <section className="view-stack">
      <section className="stats-grid">
        <article className="surface-card pad-lg">
          <span>Attendance rate</span>
          <strong className="hero-number">96.8%</strong>
          <p className="success-note">Company target met</p>
        </article>
        <article className="surface-card pad-lg">
          <span>Exceptions</span>
          <strong className="hero-number">14</strong>
          <p className="warning-note">Needs review today</p>
        </article>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <h3>Department trend</h3>
        </div>
        <div className="metric-list">
          <MetricRow title="Operations" description="Strong compliance this week." value="98%" accent="success" />
          <MetricRow title="Field Support" description="Three unresolved missing logs." value="91%" accent="warning" />
          <MetricRow title="Finance" description="Consistent on-time clock-ins." value="97%" accent="success" />
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <h3>Action queue</h3>
        </div>
        <div className="queue-list">
          <QueueItem color="#2563eb" text="6 missing break logs need validation" count="6" />
          <QueueItem color="#f97316" text="4 overtime requests are waiting for final approval" count="4" />
          <QueueItem color="#17835f" text="2 attendance disputes are escalated to HR" count="2" />
        </div>
      </section>
    </section>
  )
}

function AccountModal() {
  return (
    <div className="modal-content">
      <div className="modal-header">
        <div>
          <h3>Account details</h3>
          <p>Profile and work information</p>
        </div>
      </div>

      <section className="account-hero">
        <div className="account-avatar">{employeeProfile.initials}</div>
        <div>
          <h4>{employeeProfile.name}</h4>
          <span className="id-badge">Employee ID: {employeeProfile.employeeId}</span>
        </div>
      </section>

      <section className="surface-card nested">
        <div className="section-header">
          <h3>Profile</h3>
        </div>
        <div className="metric-list">
          <MetricRow title="Department" description="" value={employeeProfile.department} accent="plain" />
          <MetricRow title="Position" description="" value={employeeProfile.position} accent="plain" />
          <MetricRow title="Email" description="" value={employeeProfile.email} accent="plain" />
          <MetricRow title="Mobile" description="" value={employeeProfile.mobile} accent="plain" />
        </div>
      </section>

      <section className="surface-card nested">
        <div className="section-header">
          <h3>Work details</h3>
        </div>
        <div className="metric-list">
          <MetricRow title="Shift schedule" description="" value={employeeProfile.shiftSchedule} accent="info" />
          <MetricRow title="Reporting manager" description="" value={employeeProfile.manager} accent="plain" />
          <MetricRow title="Office location" description="" value={employeeProfile.location} accent="plain" />
        </div>
      </section>
    </div>
  )
}

function RequestDetailsModal({ request }: { request: RequestItem }) {
  return (
    <div className="modal-content">
      <div className="modal-header">
        <div>
          <h3>{request.title}</h3>
          <p>{request.summary}</p>
        </div>
      </div>

      <section className="status-card" style={{ backgroundColor: request.accentSoft }}>
        <span>Request status</span>
        <strong style={{ color: request.statusColor }}>{request.status}</strong>
      </section>

      <section className="surface-card nested">
        <div className="detail-list">
          {request.details.map((detail) =>
            detail.emphasis ? (
              <div key={detail.label} className="detail-callout">
                <span>{detail.label}</span>
                <p>{detail.value}</p>
              </div>
            ) : (
              <div key={detail.label} className="detail-row">
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  )
}

function FormModal({
  title,
  subtitle,
  fields,
  onSubmit,
  onCancel,
  message,
  messageTone,
}: {
  title: string
  subtitle: string
  fields: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  message: string | null
  messageTone: 'success' | 'error'
}) {
  return (
    <form className="modal-content" onSubmit={onSubmit}>
      <div className="modal-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      <section className="surface-card nested">
        <div className="section-header">
          <h3>Request details</h3>
        </div>
        <div className="form-stack">{fields}</div>

        {message && <p className={messageTone === 'success' ? 'form-message success-text' : 'form-message error-text'}>{message}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Submit request
          </button>
        </div>
      </section>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function TimelineItem({ color, title, detail, time }: { color: string; title: string; detail: string; time: string }) {
  return (
    <div className="timeline-item">
      <span className="timeline-dot" style={{ backgroundColor: color }} />
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <time>{time}</time>
    </div>
  )
}

function CompactLogCard({ log, onClick, compact = false }: { log: (typeof timeLogs)[number]; onClick?: () => void; compact?: boolean }) {
  return (
    <button type="button" className={compact ? 'compact-log-card compact' : 'compact-log-card'} onClick={onClick}>
      <div>
        <strong>{compact ? log.dateTitle.replace(',', '') : log.dateTitle}</strong>
        <p>{compact ? log.summary.replace(' • 12:01 PM break • 1:04 PM resume', '') : log.summary}</p>
      </div>
      <span>{log.duration}</span>
    </button>
  )
}

function LogCard({ log, focused }: { log: (typeof timeLogs)[number]; focused: boolean }) {
  return (
    <article className={focused ? 'log-card focused' : 'log-card'}>
      <div className="log-date-badge" style={{ backgroundColor: log.accentSoft, color: log.accent }}>
        <span>{log.dayLabel}</span>
        <strong>{log.dateNumber}</strong>
        <span>{log.monthLabel}</span>
      </div>
      <div>
        <strong>{log.dateTitle}</strong>
        <p>{log.summary}</p>
      </div>
      <span className="log-duration">{log.duration}</span>
    </article>
  )
}

function MetricRow({
  title,
  description,
  value,
  accent,
}: {
  title: string
  description: string
  value: string
  accent: 'success' | 'warning' | 'info' | 'plain'
}) {
  return (
    <div className="metric-row">
      <div>
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <span className={`metric-value ${accent}`}>{value}</span>
    </div>
  )
}

function QueueItem({ color, text, count }: { color: string; text: string; count: string }) {
  return (
    <div className="queue-item">
      <span className="queue-bar" style={{ backgroundColor: color }} />
      <p>{text}</p>
      <strong style={{ color }}>{count}</strong>
    </div>
  )
}

function buildDashboardState(attendance: AttendanceState) {
  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!attendance.clockInTime) {
    return {
      currentDate,
      clockButtonLabel: 'Clock In',
      clockButtonDisabled: false,
      breakButtonLabel: 'Start Break',
      breakButtonDisabled: true,
      shiftHint: 'Clock in to begin your shift tracking.',
      hoursWorked: '00h 00m',
      hoursWorkedNote: 'Waiting for first clock in',
      punctualityValue: '--',
      punctualityNote: 'Updates after clock in',
      timeline: {
        primary: {
          color: '#94a3b8',
          title: 'Shift not started',
          detail: 'Clock in from the dashboard to begin tracking.',
          time: '--',
        },
        secondary: {
          color: '#cbd5e1',
          title: 'Break unavailable',
          detail: 'Start break becomes available after clock in.',
          time: '--',
        },
      },
    }
  }

  const activeBreakMs = attendance.breakStartTime ? now.getTime() - attendance.breakStartTime.getTime() : 0
  const totalBreakMs = attendance.accumulatedBreakMs + (attendance.isClockedOut ? 0 : activeBreakMs)
  const referenceTime = attendance.clockOutTime ?? now
  const workedMs = Math.max(0, referenceTime.getTime() - attendance.clockInTime.getTime() - totalBreakMs)
  const punctuality = buildPunctuality(attendance.clockInTime)

  if (attendance.isClockedOut) {
    return {
      currentDate,
      clockButtonLabel: 'Clocked Out',
      clockButtonDisabled: true,
      breakButtonLabel: 'Break Closed',
      breakButtonDisabled: true,
      shiftHint: `Shift closed at ${formatTime(referenceTime)}.`,
      hoursWorked: formatDuration(workedMs),
      hoursWorkedNote: 'Daily record captured',
      punctualityValue: punctuality.value,
      punctualityNote: punctuality.note,
      timeline: {
        primary: {
          color: '#1fa55b',
          title: 'Clocked out',
          detail: 'Daily shift completed.',
          time: formatTime(referenceTime),
        },
        secondary: {
          color: '#1fa55b',
          title: 'Break status',
          detail: totalBreakMs > 0 ? `Total break logged: ${formatDuration(totalBreakMs)}` : 'No break recorded for this shift.',
          time: totalBreakMs > 0 ? formatDuration(totalBreakMs) : '--',
        },
      },
    }
  }

  if (attendance.breakStartTime) {
    return {
      currentDate,
      clockButtonLabel: 'Clock Out',
      clockButtonDisabled: false,
      breakButtonLabel: 'End Break',
      breakButtonDisabled: false,
      shiftHint: `Break started at ${formatTime(attendance.breakStartTime)}.`,
      hoursWorked: formatDuration(workedMs),
      hoursWorkedNote: 'Work timer paused for break',
      punctualityValue: punctuality.value,
      punctualityNote: punctuality.note,
      timeline: {
        primary: {
          color: '#1fa55b',
          title: 'Clocked in',
          detail: 'Recorded from dashboard.',
          time: formatTime(attendance.clockInTime),
        },
        secondary: {
          color: '#f59e0b',
          title: 'Break started',
          detail: 'Recorded from dashboard.',
          time: formatTime(attendance.breakStartTime),
        },
      },
    }
  }

  return {
    currentDate,
    clockButtonLabel: 'Clock Out',
    clockButtonDisabled: false,
    breakButtonLabel: 'Start Break',
    breakButtonDisabled: false,
    shiftHint: 'Break control is now available for this shift.',
    hoursWorked: formatDuration(workedMs),
    hoursWorkedNote: 'Shift started',
    punctualityValue: punctuality.value,
    punctualityNote: punctuality.note,
    timeline: {
      primary: {
        color: '#1fa55b',
        title: 'Clocked in',
        detail: 'Recorded from dashboard.',
        time: formatTime(attendance.clockInTime),
      },
      secondary: {
        color: '#f59e0b',
        title: 'Break available',
        detail: 'Start break when you need to pause.',
        time: '--',
      },
    },
  }
}

function buildPunctuality(clockInTime: Date) {
  const clockInMinutes = clockInTime.getHours() * 60 + clockInTime.getMinutes()
  const difference = clockInMinutes - scheduledStartMinutes

  if (difference <= 0) {
    const label = difference === 0 ? 'Right on time' : `${Math.abs(difference)} ${Math.abs(difference) === 1 ? 'min' : 'mins'} early`
    return { value: '100%', note: label }
  }

  if (difference <= 5) {
    return { value: '99%', note: `${difference} ${difference === 1 ? 'min' : 'mins'} late` }
  }

  return { value: '96%', note: `${difference} mins late` }
}

function formatDuration(durationMs: number) {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const tabItems: Array<{ id: TabId; label: string; caption: string }> = [
  { id: 'dashboard', label: 'Dashboard', caption: 'Shift control and attendance status' },
  { id: 'logs', label: 'Logs', caption: 'Daily entries and pay period view' },
  { id: 'requests', label: 'Requests', caption: 'Leave, correction, and approvals' },
  { id: 'insights', label: 'Insights', caption: 'Attendance trends and action queue' },
]

export default App
