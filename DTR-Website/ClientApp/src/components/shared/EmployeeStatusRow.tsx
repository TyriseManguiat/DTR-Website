import type { EmployeeStatus } from '../../types'
import '../../styles/components/shared.css'

export function EmployeeStatusRow({ employee }: { employee: EmployeeStatus }) {
  return (
    <article className="employee-status-row">
      <div>
        <strong>{employee.name}</strong>
        <p>
          {employee.department} • {employee.schedule}
        </p>
      </div>
      <p>{employee.lastActivity}</p>
      <span className="status-pill employee" style={{ color: employee.statusColor, backgroundColor: employee.statusSoft }}>
        {employee.status}
      </span>
    </article>
  )
}
