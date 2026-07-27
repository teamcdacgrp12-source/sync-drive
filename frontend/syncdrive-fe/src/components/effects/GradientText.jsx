import './GradientText.css'

export default function GradientText({ children, className = '' }) {
  return <span className={`gradient-text ${className}`}>{children}</span>
}
