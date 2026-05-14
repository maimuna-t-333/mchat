'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import MessageBubble from '@/components/MessageBubble'
import MessageInput from '@/components/MessageInput'

export default function RoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId

  const [room, setRoom] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages]=useState([])

  const bottomRef=useRef(null)

useEffect(() => {
  let channel

  const initialize = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    setUser(session.user)

    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !roomData) {
      router.push('/chat')
      return
    }

    setRoom(roomData)
    await fetchMessages(session.user)
    setLoading(false)

    channel = supabase
      .channel(`room-${roomId}-${Date.now()}`) 
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()
  }

  initialize()

  return () => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}, [roomId]) 

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[messages])

const fetchMessages = async (currentUser) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return  
  }

  const messageWithEmail = data.map(msg => ({
    ...msg,
    user_email: msg.user_id === currentUser.id
      ? currentUser.email
      : msg.user_email || 'Unknown'
  }))

  setMessages(messageWithEmail)
}

const handleSend = async (content) => {
  if (!user) return

  const { error } = await supabase  
    .from('messages')
    .insert({
      content,
      user_id: user.id,
      room_id: roomId,
      user_email: user.email,
    })

  if (error) {
    console.error('Error sending message:', error)
  }
}

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Loading room...</p>
      </div>
    )
  }

  return (
 <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="text-gray-400 hover:text-white transition"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {room?.name?.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-white font-semibold">
              # {room?.name}
            </h1>
            <p className="text-gray-400 text-xs">
              {room?.description}
            </p>
          </div>
        </div>
        <span className="text-gray-500 text-xs hidden sm:block">
          {user?.email}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-400">No messages yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Be the first to say something!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.user_id === user?.id}
              />
            ))}
          </>
        )}

        <div ref={bottomRef} />
      </div>


      <div className="flex-shrink-0">
        <MessageInput
          onSend={handleSend}
          disabled={!user}
        />
      </div>

    </div>
  )
}