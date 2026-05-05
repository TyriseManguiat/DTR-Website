import type { TabId } from '../types'

export const employeeTabItems: Array<{ id: TabId; label: string; caption: string }> = [
  { id: 'dashboard', label: 'Dashboard', caption: '' },
  { id: 'logs', label: 'Logs', caption: '' },
  { id: 'requests', label: 'Requests', caption: '' },
  { id: 'insights', label: 'Insights', caption: '' },
]

export const adminTabItems: Array<{ id: TabId; label: string; caption: string }> = [
  { id: 'dashboard', label: 'Dashboard', caption: '' },
  { id: 'logs', label: 'Logs', caption: '' },
  { id: 'requests', label: 'Requests', caption: '' },
  { id: 'insights', label: 'Insights', caption: '' },
]

export function getTabMonogram(tabId: TabId) {
  switch (tabId) {
    case 'dashboard':
      return 'DB'
    case 'logs':
      return 'LG'
    case 'requests':
      return 'RQ'
    case 'insights':
      return 'IN'
  }
}
