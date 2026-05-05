import { useEffect, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function AutoResizeTextarea(props: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const element = textareaRef.current
    if (!element) {
      return
    }

    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [props.value, props.defaultValue, props.placeholder])

  return (
    <textarea
      {...props}
      ref={textareaRef}
      onInput={(event) => {
        const element = event.currentTarget
        element.style.height = 'auto'
        element.style.height = `${element.scrollHeight}px`
        props.onInput?.(event)
      }}
    />
  )
}
