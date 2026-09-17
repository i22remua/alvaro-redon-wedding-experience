import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  help?: string
  textarea?: false
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  help?: string
  textarea: true
}

export function Field(props: InputProps | TextAreaProps) {
  const { label, help } = props

  if (props.textarea) {
    const { textarea: _textarea, label: _label, help: _help, ...textareaProps } = props
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        <textarea {...textareaProps} />
        {help && <small>{help}</small>}
      </label>
    )
  }

  const { textarea: _textarea, label: _label, help: _help, ...inputProps } = props
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input {...inputProps} />
      {help && <small>{help}</small>}
    </label>
  )
}
