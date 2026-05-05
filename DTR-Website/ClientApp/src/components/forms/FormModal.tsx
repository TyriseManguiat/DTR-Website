import type { FormEvent, ReactNode } from 'react'
import '../../styles/components/modals.css'

type FormModalProps = {
  title: string
  subtitle: string
  fields: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  message: string | null
  messageTone: 'success' | 'error'
}

export function FormModal({ title, subtitle, fields, onSubmit, onCancel, message, messageTone }: FormModalProps) {
  return (
    <form className="modal-content request-form-modal" onSubmit={onSubmit}>
      <div className="modal-header request-form-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="id-badge">Draft</span>
      </div>

      <div className="form-stack">{fields}</div>
      {message && <p className={messageTone === 'success' ? 'form-message success-text' : 'form-message error-text'}>{message}</p>}
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-button">
          Submit request
        </button>
      </div>
    </form>
  )
}
