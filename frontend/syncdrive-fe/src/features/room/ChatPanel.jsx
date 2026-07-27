import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { sendMessage } from '@/socket/roomSocket'
import { authUtils } from '@/features/auth/auth.utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ChatPanel({ messages = [], roomCode, profileMap = {} }) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const sessionUser = authUtils.getUser()
  const currentUsername = sessionUser?.username

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return
    sendMessage(roomCode, newMessage)
    setNewMessage('')
  }

  return (
    <div className="chat-panel">
      <div className="messages-list">
        {messages.map((message, index) => {
          const isMine = message.sender === currentUsername
          const profile = profileMap[message.sender] || profileMap[Number(message.sender)]
          const displayName = profile?.displayName || profile?.username || message.sender

          return (
            <div key={`${message.sender}-${index}`} className={`message-bubble ${isMine ? 'my-message' : ''}`}>
              {!isMine && <span className="text-xs font-semibold text-slate-500">{displayName}</span>}
              <div className="message-content">{message.content}</div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 border-t border-slate-200 bg-white p-3">
        <Input
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="Say something"
          className="h-10"
        />
        <Button type="button" onClick={handleSend} className="h-10 px-4">
          <Send size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
