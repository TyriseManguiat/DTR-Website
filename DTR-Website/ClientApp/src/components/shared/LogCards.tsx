import type { TimeLog } from '../../types'
import '../../styles/pages/logs.css'

export function CompactLogCard({ log, onClick, compact = false }: { log: TimeLog; onClick?: () => void; compact?: boolean }) {
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

export function LogCard({ log, focused }: { log: TimeLog; focused: boolean }) {
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
