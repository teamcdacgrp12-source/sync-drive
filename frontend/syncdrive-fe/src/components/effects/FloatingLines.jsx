import './FloatingLines.css'

export default function FloatingLines({ className = '' }) {
  return (
    <div className={`floating-lines ${className}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => <span key={index} style={{ '--line-index': index }} />)}
    </div>
  )
}
