'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function DMPage() {
  const { email } = useParams()
  const decodedEmail = decodeURIComponent(email)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [receiver, setReceiver] = useState(null)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

 useEffect(() => {
  let channel

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('email', decodedEmail)
      .single()

    if (profileError || !profile) {
      setError('No user found with that email.')
      return
    }
    setReceiver(profile)

    const { data: msgs } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(msgs || [])
    channel = supabase
      .channel(`dm-${user.id}-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
      }, (payload) => {
        const msg = payload.new
        if (
          (msg.sender_id === user.id && msg.receiver_id === profile.id) ||
          (msg.sender_id === profile.id && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()
  }

  init()

  return () => {
    if (channel) supabase.removeChannel(channel)
  }
}, [decodedEmail])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !receiver) return
    await supabase.from('direct_messages').insert({
      sender_id: currentUser.id,
      receiver_id: receiver.id,
      content: newMessage.trim(),
    })
    setNewMessage('')
  }

  if (error) return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <p className="text-red-400">{error}</p>
    </main>
  )

  return (
    <main className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 font-semibold text-[#168aad]">
        {receiver?.username || decodedEmail}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.sender_id === currentUser?.id
                ? 'bg-[#168aad] ml-auto text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            {msg.content}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex gap-2">
        <input
          className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-sm outline-none text-white"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          className="bg-[#168aad] px-5 py-2 rounded-full text-sm font-semibold text-white"
        >
          Send
        </motion.button>
      </div>
    </main>
  )
}