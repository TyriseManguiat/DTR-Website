import '../../styles/components/shared.css'

export function TimelineItem({ color, title, detail, time }: { color: string; title: string; detail: string; time: string }) {
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
