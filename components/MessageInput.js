'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim()) return

    onSend(message.trim())  
    setMessage('')           
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-t border-gray-700">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-full px-4"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-500"
      >
        ➤
      </Button>
    </div>
  )
}