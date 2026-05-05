import '../../styles/components/shared.css'

export function QueueItem({ color, text, count }: { color: string; text: string; count: string }) {
  return (
    <div className="queue-item">
      <span className="queue-bar" style={{ backgroundColor: color }} />
      <p>{text}</p>
      <strong style={{ color }}>{count}</strong>
    </div>
  )
}
