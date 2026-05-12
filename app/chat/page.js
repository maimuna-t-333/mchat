'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import RoomCard from '@/components/RoomCard'
import CreateRoomModal from '@/components/CreateRoomModal'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      await fetchRooms()
      setLoading(false)
    }

    initialize()
  }, [router])

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')              
      .order('created_at', { ascending: false }) 

    if (error) {
      console.error('Error fetching rooms:', error)
      return
    }

    setRooms(data)
  }

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-white font-bold text-xl">MChat</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">
            {user?.email}
          </span>
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
          >
            + New Room
          </Button>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-semibold">
            Chat Rooms
          </h2>
          <span className="text-gray-400 text-sm">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Rooms list */}
        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No rooms yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Create the first room to get started!
            </p>
            <Button
              className="mt-4"
              onClick={() => setShowModal(true)}
            >
              Create a Room
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateRoomModal
          userId={user.id}
          onRoomCreated={handleRoomCreated}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}