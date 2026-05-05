import { useEffect, useMemo, useState } from 'react'
import type { TimeLog } from '../../types'
import '../../styles/pages/logs.css'

const LOGS_PER_PAGE = 6

export function AdminLogsPage({ logs }: { logs: TimeLog[] }) {
  const employeeOptions = useMemo(
    () =>
      Array.from(new Set(logs.map((log) => log.employeeName).filter((name): name is string => Boolean(name)))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [logs],
  )

  const [selectedEmployee, setSelectedEmployee] = useState<string>(employeeOptions[0] ?? 'all')
  const [currentPage, setCurrentPage] = useState(1)

  const visibleLogs = useMemo(() => {
    if (selectedEmployee === 'all') {
      return logs
    }

    return logs.filter((log) => log.employeeName === selectedEmployee)
  }, [logs, selectedEmployee])

  const totalPages = Math.max(1, Math.ceil(visibleLogs.length / LOGS_PER_PAGE))
  const currentPageStart = (currentPage - 1) * LOGS_PER_PAGE
  const pagedLogs = visibleLogs.slice(currentPageStart, currentPageStart + LOGS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedEmployee])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  return (
    <section className="view-stack">
      <section className="surface-card admin-logs-overview">
        <div className="admin-logs-overview-top">
          <div>
            <h3>Logs review</h3>
            <span className="muted">Select an employee to inspect attendance history</span>
          </div>
          <div className="admin-log-toolbar">
            <label className="admin-log-filter">
              <span>Employee</span>
              <select value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>
                {employeeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3>Attendance records</h3>
            <span className="muted">Filtered log entries for the selected employee</span>
          </div>
          <span className="status-chip">{visibleLogs.length} logs</span>
        </div>

        <div className="admin-log-list">
          {pagedLogs.map((log) => (
            <article key={log.id} className="admin-log-row">
              <div className="admin-log-main">
                <strong>{log.employeeName}</strong>
                <p>
                  {log.department} • {log.dateTitle}
                </p>
              </div>
              <p className="admin-log-summary">{log.summary}</p>
              <span className="status-pill employee" style={{ color: log.accent, backgroundColor: log.accentSoft }}>
                {log.duration}
              </span>
            </article>
          ))}
        </div>

        {visibleLogs.length > LOGS_PER_PAGE && (
          <div className="log-pagination">
            <button
              type="button"
              className="text-button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="log-pagination-label">
              Showing {currentPageStart + 1}-{Math.min(currentPageStart + pagedLogs.length, visibleLogs.length)} of {visibleLogs.length}
            </span>
            <button
              type="button"
              className="text-button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </section>
  )
}
