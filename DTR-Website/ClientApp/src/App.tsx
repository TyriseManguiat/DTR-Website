import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AccountModal } from './components/modals/AccountModal'
import { AutoResizeTextarea } from './components/forms/AutoResizeTextarea'
import { Field } from './components/forms/Field'
import { FormModal } from './components/forms/FormModal'
import { RequestDetailsModal } from './components/modals/RequestDetailsModal'
import { LoginScreen } from './components/shared/LoginScreen'
import { adminTabItems, employeeTabItems, getTabMonogram } from './config/navigation'
import { employeeRequestItems, employeeStatuses, employeeTimeLogs, mockUsers } from './data'
import { AdminDashboardPage } from './pages/admin/DashboardPage'
import { AdminInsightsPage } from './pages/admin/InsightsPage'
import { AdminLogsPage } from './pages/admin/LogsPage'
import { AdminRequestsPage } from './pages/admin/RequestsPage'
import { EmployeeDashboardPage } from './pages/employee/DashboardPage'
import { EmployeeInsightsPage } from './pages/employee/InsightsPage'
import { EmployeeLogsPage } from './pages/employee/LogsPage'
import { EmployeeRequestsPage } from './pages/employee/RequestsPage'
import './styles/layout/app-shell.css'
import './styles/components/surfaces.css'
import type { AppUser, ModalView, TabId } from './types'
import { buildDashboardState, buildEmployeeStats, initialAttendance } from './utils/dashboard'

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [activeModal, setActiveModal] = useState<ModalView | null>(null)
  const [attendance, setAttendance] = useState(initialAttendance)
  const [focusedLogId, setFocusedLogId] = useState<string | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const dashboard = useMemo(() => buildDashboardState(attendance, now), [attendance, now])
  const visibleLogs = currentUser?.role === 'admin'
    ? employeeTimeLogs
    : employeeTimeLogs.filter((log) => log.employeeName === currentUser?.name)
  const visibleRequests = currentUser?.role === 'admin'
    ? employeeRequestItems
    : employeeRequestItems.filter((request) => request.employeeName === currentUser?.name)
  const detailRequest =
    activeModal?.type === 'request-details'
      ? visibleRequests.find((item) => item.id === activeModal.requestId) ?? null
      : null

  if (!currentUser) {
    return (
      <LoginScreen
        error={loginError}
        onLogin={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          const email = String(formData.get('email') ?? '').trim().toLowerCase()
          const password = String(formData.get('password') ?? '')
          const matchedUser = mockUsers.find((user) => user.email.toLowerCase() === email && user.password === password)

          if (!matchedUser) {
            setLoginError('Invalid email or password.')
            return
          }

          setCurrentUser(matchedUser)
          setLoginError(null)
          setActiveTab('dashboard')
          setAttendance(initialAttendance)
        }}
      />
    )
  }

  const openLogs = (logId?: string) => {
    setActiveTab('logs')
    setFocusedLogId(logId ?? null)
  }

  const handleClockAction = () => {
    const actionTime = new Date()

    setAttendance((current) => {
      if (!current.clockInTime) {
        return {
          clockInTime: actionTime,
          clockOutTime: null,
          breakStartTime: null,
          accumulatedBreakMs: 0,
          isClockedOut: false,
        }
      }

      if (current.isClockedOut) {
        return current
      }

      const extraBreak = current.breakStartTime ? actionTime.getTime() - current.breakStartTime.getTime() : 0

      return {
        ...current,
        clockOutTime: actionTime,
        breakStartTime: null,
        accumulatedBreakMs: current.accumulatedBreakMs + extraBreak,
        isClockedOut: true,
      }
    })
  }

  const closeModal = () => {
    setActiveModal(null)
    setFormMessage(null)
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    setLoginError(null)
    setActiveModal(null)
    setFormMessage(null)
    setActiveTab('dashboard')
    setProfileMenuOpen(false)
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

  const tabItems = currentUser.role === 'admin' ? adminTabItems : employeeTabItems

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="brand-row">
              <div className="brand-mark">DTR</div>
              <div className="brand-lockup">
                <span className="brand-kicker">Workforce Console</span>
              </div>
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
                <span className="nav-pill-icon" aria-hidden="true">
                  {getTabMonogram(item.id)}
                </span>
                <span className="nav-pill-copy">{item.label}</span>
              </button>
            ))}
          </nav>

          <section className="profile-card">
            <button type="button" className="profile-card-trigger" onClick={() => setProfileMenuOpen((value) => !value)}>
              <div className="profile-top">
                <div className="avatar">{currentUser.initials}</div>
                <div className="profile-identity">
                  <h2>{currentUser.name}</h2>
                  <p>{currentUser.role === 'admin' ? `Admin • ${currentUser.position}` : currentUser.position}</p>
                </div>
                <span className={profileMenuOpen ? 'profile-chevron open' : 'profile-chevron'}>
                  <span aria-hidden="true">▾</span>
                </span>
              </div>
              <div className="profile-meta">
                <span className="status-chip">{currentUser.role === 'admin' ? 'Admin access' : 'Employee access'}</span>
                <span className="status-chip online">Online</span>
              </div>
            </button>
            {profileMenuOpen && (
              <div className="profile-menu">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setActiveModal({ type: 'account' })
                    setProfileMenuOpen(false)
                  }}
                >
                  Account details
                </button>
                <button type="button" className="profile-menu-item signout-button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </section>
        </aside>

        <main className="workspace">
          {activeTab !== 'requests' && activeTab !== 'dashboard' && (
            <header className="workspace-header">
              <div>
                <p className="eyebrow">{tabItems.find((item) => item.id === activeTab)?.caption}</p>
                <h2>{tabItems.find((item) => item.id === activeTab)?.label}</h2>
              </div>
            </header>
          )}

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

          {activeTab === 'dashboard' &&
            (currentUser.role === 'admin' ? (
              <AdminDashboardPage
                user={currentUser}
                currentDate={now.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                logs={visibleLogs}
                requests={visibleRequests}
                statuses={employeeStatuses}
                onOpenLogs={() => setActiveTab('logs')}
              />
            ) : (
              <EmployeeDashboardPage
                user={currentUser}
                dashboard={dashboard}
                stats={buildEmployeeStats(visibleLogs)}
                onClockAction={handleClockAction}
                onOpenLogs={openLogs}
                recentLogs={visibleLogs}
              />
            ))}

          {activeTab === 'logs' &&
            (currentUser.role === 'admin' ? (
              <AdminLogsPage logs={visibleLogs} />
            ) : (
              <EmployeeLogsPage
                logs={visibleLogs}
                focusedLogId={focusedLogId}
              />
            ))}

          {activeTab === 'requests' &&
            (currentUser.role === 'admin' ? (
              <AdminRequestsPage requests={visibleRequests} onOpenDetails={(requestId) => setActiveModal({ type: 'request-details', requestId })} />
            ) : (
              <EmployeeRequestsPage
                requests={visibleRequests}
                onLeaveRequest={() => setActiveModal({ type: 'leave' })}
                onCorrectionRequest={() => setActiveModal({ type: 'correction' })}
                onOpenDetails={(requestId) => setActiveModal({ type: 'request-details', requestId })}
              />
            ))}

          {activeTab === 'insights' && (currentUser.role === 'admin' ? <AdminInsightsPage /> : <EmployeeInsightsPage />)}
        </main>
      </div>

      {activeModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
              ×
            </button>

            {activeModal.type === 'account' && <AccountModal user={currentUser} />}

            {currentUser.role !== 'admin' && activeModal.type === 'leave' && (
              <FormModal
                title="Leave request"
                subtitle="Submit a leave request for approval."
                message={formMessage}
                messageTone={formMessage?.includes('submitted') ? 'success' : 'error'}
                onSubmit={(event) =>
                  handleSubmitForm(
                    event,
                    (formData) => {
                      if (
                        !formData.get('leaveType') ||
                        !formData.get('coverage') ||
                        !formData.get('durationType') ||
                        !String(formData.get('reason') ?? '').trim()
                      ) {
                        return 'Complete the leave type, duration, coverage, and reason.'
                      }
                      return null
                    },
                    'Leave request submitted for manager review.',
                  )
                }
                fields={
                  <>
                    <section className="form-section">
                      <div className="form-section-header">
                        <h4>Schedule</h4>
                      </div>
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
                      <div className="form-grid">
                        <Field label="Duration">
                          <select name="durationType" defaultValue="Full day">
                            <option>Full day</option>
                            <option>Half day - AM</option>
                            <option>Half day - PM</option>
                          </select>
                        </Field>
                        <Field label="Attachment">
                          <input type="text" name="attachmentLabel" placeholder="Optional supporting document" />
                        </Field>
                      </div>
                    </section>

                    <section className="form-section">
                      <div className="form-section-header">
                        <h4>Coverage</h4>
                      </div>
                      <Field label="Shift coverage">
                        <select name="coverage" defaultValue="No coverage needed">
                          <option>No coverage needed</option>
                          <option>Buddy coverage</option>
                          <option>Supervisor-managed coverage</option>
                        </select>
                      </Field>
                      <Field label="Coverage notes">
                        <AutoResizeTextarea name="coverageNotes" rows={3} placeholder="Who will cover, handoff notes, or dispatch impact." />
                      </Field>
                    </section>

                    <section className="form-section">
                      <div className="form-section-header">
                        <h4>Justification</h4>
                      </div>
                      <Field label="Reason">
                        <AutoResizeTextarea name="reason" rows={4} placeholder="Describe the leave request and supporting context." />
                      </Field>
                    </section>
                  </>
                }
                onCancel={closeModal}
              />
            )}

            {currentUser.role !== 'admin' && activeModal.type === 'correction' && (
              <FormModal
                title="Correction request"
                subtitle="Submit a time log correction for review."
                message={formMessage}
                messageTone={formMessage?.includes('submitted') ? 'success' : 'error'}
                onSubmit={(event) =>
                  handleSubmitForm(
                    event,
                    (formData) => {
                      if (
                        !formData.get('correctionType') ||
                        !formData.get('source') ||
                        !String(formData.get('expectedTimeIn') ?? '').trim() ||
                        !String(formData.get('expectedTimeOut') ?? '').trim() ||
                        !String(formData.get('reason') ?? '').trim()
                      ) {
                        return 'Complete the correction type, expected time in/out, source, and reason.'
                      }
                      return null
                    },
                    'Correction request submitted for manager review.',
                  )
                }
                fields={
                  <>
                    <section className="form-section">
                      <div className="form-section-header">
                        <h4>Affected record</h4>
                        <p>Identify the log and correction category.</p>
                      </div>
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
                    </section>

                    <section className="form-section">
                      <div className="form-section-header">
                        <h4>Expected values</h4>
                        <p>Provide the corrected attendance entries.</p>
                      </div>
                      <div className="form-grid">
                        <Field label="Expected time in">
                          <input type="time" name="expectedTimeIn" defaultValue="08:01" />
                        </Field>
                        <Field label="Expected time out">
                          <input type="time" name="expectedTimeOut" defaultValue="17:03" />
                        </Field>
                      </div>
                      <div className="form-grid">
                        <Field label="Source">
                          <select name="source" defaultValue="Biometric log">
                            <option>Biometric log</option>
                            <option>Supervisor confirmation</option>
                            <option>Manual entry</option>
                          </select>
                        </Field>
                        <Field label="Break adjustment">
                          <select name="breakAdjustment" defaultValue="No break adjustment">
                            <option>No break adjustment</option>
                            <option>Add missing break</option>
                            <option>Remove invalid break</option>
                            <option>Adjust break duration</option>
                          </select>
                        </Field>
                      </div>
                    </section>

                    <section className="form-section">
                      <div className="form-section-header">
                        <h4>Evidence and note</h4>
                        <p>Attach proof details and explain the correction.</p>
                      </div>
                      <Field label="Proof details">
                        <AutoResizeTextarea name="proofDetails" rows={3} placeholder="Reference the biometric log, supervisor confirmation, or other evidence." />
                      </Field>
                      <Field label="Reason">
                        <AutoResizeTextarea name="reason" rows={4} placeholder="Describe what should be corrected and why." />
                      </Field>
                    </section>
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

export default App
