'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function RoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId

  const [room, setRoom] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)   
        .single()

      if (error || !data) {
        router.push('/chat') 
        return
      }

      setRoom(data)
      setLoading(false)
    }

    initialize()
  }, [roomId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Loading room...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-white font-bold">
              # {room?.name}
            </h1>
            <p className="text-gray-400 text-xs">
              {room?.description}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-sm hidden sm:block">
          {user?.email}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">
          Message
        </p>
      </div>

      <div className="px-4 py-4 bg-gray-800 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-700 rounded-lg px-4 py-3 text-gray-500">
            Message
          </div>
        </div>
      </div>

    </div>
  )
}