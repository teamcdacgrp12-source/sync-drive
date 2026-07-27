import { ArrowRight, MessageCircleMore, MonitorPlay, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import FloatingLines from '@/components/effects/FloatingLines'
import GradientText from '@/components/effects/GradientText'
import PixelSnow from '@/components/effects/PixelSnow'

const highlights = [
  { icon: MonitorPlay, title: 'Stay in sync', text: 'Start a video and keep every viewer on the same moment.' },
  { icon: MessageCircleMore, title: 'Chat live', text: 'Share reactions while the room watches together.' },
  { icon: UsersRound, title: 'Invite your people', text: 'Create a room and bring your friends along.' },
]

export default function Landing() {
  return (
    <div className="relative space-y-16 py-10 sm:py-20">
      <FloatingLines />
      <PixelSnow />
      <section className="relative mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">Watch together</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Every watch party, perfectly in <GradientText>sync</GradientText>.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">SyncDrive brings video, conversation, and your favorite people into one shared room.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            Create an account <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-8 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100">
            Sign in
          </Link>
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="mb-5 grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={22} aria-hidden="true" /></span>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
