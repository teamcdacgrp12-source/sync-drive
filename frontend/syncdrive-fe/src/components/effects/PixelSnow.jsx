import './PixelSnow.css'

export default function PixelSnow() {
  return (
    <div className="pixel-snow" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  )
}
