import { useEffect, useMemo, useState } from 'react'
import type { TimeLog } from '../../types'
import '../../styles/pages/logs.css'

const LOGS_PER_PAGE = 5

export function EmployeeLogsPage({
  logs,
  focusedLogId,
}: {
  logs: TimeLog[]
  focusedLogId: string | null
}) {
  const [activeFilter, setActiveFilter] = useState<'pay-period' | 'month'>('pay-period')
  const [currentPage, setCurrentPage] = useState(1)
  const filteredLogs = useMemo(() => filterLogs(logs, activeFilter), [logs, activeFilter])
  const summary = buildLogsSummary(filteredLogs)
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE))
  const currentPageStart = (currentPage - 1) * LOGS_PER_PAGE
  const visibleLogs = filteredLogs.slice(currentPageStart, currentPageStart + LOGS_PER_PAGE)

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  useEffect(() => {
    if (!focusedLogId) {
      return
    }

    const focusedIndex = filteredLogs.findIndex((log) => log.id === focusedLogId)
    if (focusedIndex === -1) {
      return
    }

    setCurrentPage(Math.floor(focusedIndex / LOGS_PER_PAGE) + 1)
  }, [filteredLogs, focusedLogId])

  return (
    <section className="view-stack">
      <section className="surface-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Attendance overview</span>
            <h3>Current Pay Period</h3>
          </div>
          <div className="log-filter-group">
            <button
              type="button"
              className={activeFilter === 'pay-period' ? 'log-filter active' : 'log-filter'}
              onClick={() => setActiveFilter('pay-period')}
            >
              Current pay period
            </button>
            <button
              type="button"
              className={activeFilter === 'month' ? 'log-filter active' : 'log-filter'}
              onClick={() => setActiveFilter('month')}
            >
              This month
            </button>
          </div>
        </div>

        <div className="log-summary-grid">
          <article className="log-summary-card">
            <span>Present Days</span>
            <strong>{summary.presentDays}</strong>
          </article>
          <article className="log-summary-card">
            <span>Total Hours</span>
            <strong>{summary.totalHours}</strong>
          </article>
          <article className="log-summary-card">
            <span>Late Minutes</span>
            <strong className="warning-text">{summary.lateMinutes}</strong>
          </article>
          <article className="log-summary-card">
            <span>Overtime</span>
            <strong>{summary.overtime}</strong>
          </article>
        </div>
      </section>

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3>Attendance Logs</h3>
            <span className="muted">Daily time records and attendance status</span>
          </div>
          <span className="muted">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="log-table">
          <div className="log-table-head">
            <span>Date</span>
            <span>Time In</span>
            <span>Time Out</span>
            <span>Break</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          <div className="entry-list">
            {visibleLogs.length > 0 ? (
              visibleLogs.map((log) => {
                const details = parseLogSummary(log.summary)
                const status = getLogStatus(details.timeIn)

                return (
                  <article key={log.id} className={focusedLogId === log.id ? 'log-row focused' : 'log-row'}>
                    <div className="log-row-date">
                      <strong>{log.dateTitle}</strong>
                      <p>{log.dayLabel}</p>
                    </div>
                    <span>{details.timeIn ?? '--'}</span>
                    <span>{details.timeOut ?? '--'}</span>
                    <span>{details.breakWindow}</span>
                    <strong>{log.duration}</strong>
                    <span className={`log-status ${status.tone}`}>{status.label}</span>
                  </article>
                )
              })
            ) : (
              <div className="log-empty-state">
                <strong>No logs found</strong>
                <p>No attendance records are available for this filter.</p>
              </div>
            )}
          </div>
        </div>

        {filteredLogs.length > LOGS_PER_PAGE && (
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
              Showing {currentPageStart + 1}-{Math.min(currentPageStart + visibleLogs.length, filteredLogs.length)} of {filteredLogs.length}
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

function buildLogsSummary(logs: TimeLog[]) {
  const presentDays = logs.length
  const totalMinutes = logs.reduce((sum, log) => sum + parseDurationMinutes(log.duration), 0)
  const lateMinutes = logs.reduce((sum, log) => {
    const timeInMinutes = parseTimeToMinutes(parseLogSummary(log.summary).timeIn)
    return sum + Math.max(0, timeInMinutes - 8 * 60)
  }, 0)
  const overtimeMinutes = logs.reduce((sum, log) => sum + Math.max(0, parseDurationMinutes(log.duration) - 8 * 60), 0)

  return {
    presentDays: String(presentDays),
    totalHours: formatDurationFromMinutes(totalMinutes),
    lateMinutes: `${lateMinutes}m`,
    overtime: formatDurationFromMinutes(overtimeMinutes),
  }
}

function filterLogs(logs: TimeLog[], filter: 'pay-period' | 'month') {
  if (logs.length === 0) {
    return logs
  }

  const parsedLogs = logs
    .map((log) => ({ log, date: parseLogDate(log) }))
    .filter((item): item is { log: TimeLog; date: Date } => item.date !== null)

  if (parsedLogs.length === 0) {
    return logs
  }

  const latestDate = parsedLogs.reduce((latest, item) => (item.date > latest ? item.date : latest), parsedLogs[0].date)

  if (filter === 'month') {
    return parsedLogs
      .filter((item) => item.date.getMonth() === latestDate.getMonth() && item.date.getFullYear() === latestDate.getFullYear())
      .map((item) => item.log)
  }

  const periodStartDay = latestDate.getDate() <= 15 ? 1 : 16
  const periodStart = new Date(latestDate.getFullYear(), latestDate.getMonth(), periodStartDay)
  const periodEnd = new Date(
    latestDate.getFullYear(),
    latestDate.getMonth(),
    periodStartDay === 1 ? 15 : new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0).getDate(),
  )

  return parsedLogs
    .filter((item) => item.date >= periodStart && item.date <= periodEnd)
    .map((item) => item.log)
}

function parseLogSummary(summary: string) {
  const parts = summary.split(' • ')
  const timeIn = parts.find((part) => part.includes(' in'))?.replace(' in', '') ?? null
  const breakStart = parts.find((part) => part.includes(' break'))?.replace(' break', '') ?? null
  const breakEnd = parts.find((part) => part.includes(' resume'))?.replace(' resume', '') ?? null
  const timeOut = parts.find((part) => part.includes(' out'))?.replace(' out', '') ?? null

  return {
    timeIn,
    timeOut,
    breakWindow: breakStart && breakEnd ? `${breakStart} - ${breakEnd}` : '--',
  }
}

function getLogStatus(timeIn: string | null) {
  const minutes = parseTimeToMinutes(timeIn)

  if (!timeIn) {
    return { label: 'Incomplete', tone: 'warning' as const }
  }

  if (minutes > 8 * 60) {
    return { label: 'Late', tone: 'warning' as const }
  }

  return { label: 'Present', tone: 'success' as const }
}

function parseDurationMinutes(duration: string) {
  const match = duration.match(/(\d+)h\s+(\d+)m/i)
  if (!match) {
    return 0
  }

  return Number(match[1]) * 60 + Number(match[2])
}

function formatDurationFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
}

function parseTimeToMinutes(value: string | null) {
  if (!value) {
    return 0
  }

  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) {
    return 0
  }

  let hours = Number(match[1]) % 12
  if (match[3].toUpperCase() === 'PM') {
    hours += 12
  }

  return hours * 60 + Number(match[2])
}

function parseLogDate(log: TimeLog) {
  const monthIndex = monthMap[log.monthLabel.toUpperCase()]
  if (monthIndex === undefined) {
    return null
  }

  const day = Number(log.dateNumber)
  if (Number.isNaN(day)) {
    return null
  }

  return new Date(2026, monthIndex, day)
}

const monthMap: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
}
