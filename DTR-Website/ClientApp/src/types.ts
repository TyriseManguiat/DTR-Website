export type TabId = 'dashboard' | 'logs' | 'requests' | 'insights'
export type UserRole = 'employee' | 'admin'

export type AppUser = {
  id: string
  role: UserRole
  name: string
  initials: string
  employeeId: string
  department: string
  position: string
  email: string
  mobile: string
  shiftSchedule: string
  manager: string
  location: string
  password: string
}

export type ModalView =
  | { type: 'account' }
  | { type: 'leave' }
  | { type: 'correction' }
  | { type: 'request-details'; requestId: string }

export type TimeLog = {
  id: string
  employeeName?: string
  department?: string
  dayLabel: string
  dateNumber: string
  monthLabel: string
  dateTitle: string
  summary: string
  duration: string
  accent: string
  accentSoft: string
}

export type RequestItem = {
  id: string
  employeeName?: string
  department?: string
  title: string
  status: 'Pending' | 'Approved'
  statusColor: string
  statusSoft: string
  summary: string
  accent: string
  accentSoft: string
  details: Array<{ label: string; value: string; emphasis?: boolean }>
}

export type EmployeeStatus = {
  id: string
  name: string
  department: string
  status: 'Clocked In' | 'On Break' | 'Clocked Out' | 'Late'
  statusColor: string
  statusSoft: string
  schedule: string
  lastActivity: string
}

export type AttendanceState = {
  clockInTime: Date | null
  clockOutTime: Date | null
  breakStartTime: Date | null
  accumulatedBreakMs: number
  isClockedOut: boolean
}
