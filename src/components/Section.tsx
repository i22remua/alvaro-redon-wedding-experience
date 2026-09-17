import type { ReactNode } from 'react'

type Props = {
  number?: number
  title: string
  children: ReactNode
}

export function Section({ number, title, children }: Props) {
  return (
    <section className="section-card">
      <div className="section-heading">
        <h2>{number ? `${number}. ` : ''}{title}</h2>
        <div className="gold-line" />
      </div>
      {children}
    </section>
  )
}
