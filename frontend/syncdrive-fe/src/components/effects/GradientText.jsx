export default function GradientText({ children, className = '' }) {
  return <span className={`bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent ${className}`}>{children}</span>
}
