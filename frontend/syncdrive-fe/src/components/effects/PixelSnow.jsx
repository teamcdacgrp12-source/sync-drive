import './PixelSnow.css'

export default function PixelSnow({ count = 36, className = '' }) {
  return (
    <div className={`pixel-snow ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i
          key={index}
          style={{
            left: `${(index * 37) % 101}%`,
            top: `${-((index * 19) % 100)}%`,
            '--drift': `${((index % 5) - 2) * 3}rem`,
            animationDuration: `${5 + (index % 7) * 0.8}s`,
            animationDelay: `${index * -0.32}s`,
          }}
        />
      ))}
    </div>
  )
}
