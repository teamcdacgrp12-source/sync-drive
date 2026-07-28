import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import './room.css'

const timeLabel = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPanel({ messages = [], currentUser, onSend, disabled = false }) {
  const [content, setContent] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages])

  const submit = (event) => {
    event.preventDefault()
    const message = content.trim()
    if (!message || disabled) return
    onSend?.(message)
    setContent('')
  }

  return (
    <section className="room-sidebar h-full" aria-label="Room chat">
      <header className="border-b border-slate-200 px-4 py-3"><h2 className="font-semibold">Live chat</h2></header>
      <div className="room-chat-messages flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Be the first to say hello.</p>}
        {messages.map((message, index) => {
          const ownMessage = message.sender === currentUser?.username
          return (
            <article key={message.id ?? `${message.sender}-${index}`} className={`room-message-enter flex ${ownMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${ownMessage ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {!ownMessage && <p className="mb-1 text-xs font-semibold text-indigo-700">{message.sender}</p>}
                <p className="break-words text-sm">{message.content}</p>
                <p className={`mt-1 text-[11px] ${ownMessage ? 'text-indigo-100' : 'text-slate-400'}`}>{timeLabel(message.timestamp ?? message.sentAt)}</p>
              </div>
            </article>
          )
        })}
        <div ref={endRef} />
      </div>
      <form className="flex gap-2 border-t border-slate-200 p-3" onSubmit={submit}>
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a message" disabled={disabled} maxLength={1000} aria-label="Chat message" />
        <Button type="submit" size="icon" disabled={disabled || !content.trim()} aria-label="Send message"><Send size={17} aria-hidden="true" /></Button>
      </form>
    </section>
  )
}
