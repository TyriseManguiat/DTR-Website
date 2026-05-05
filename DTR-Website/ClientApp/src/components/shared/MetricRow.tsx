import '../../styles/components/shared.css'

export function MetricRow({
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
