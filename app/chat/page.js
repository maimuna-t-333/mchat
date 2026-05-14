'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CreateRoomModal from '@/components/CreateRoomModal'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

    if (!error) setRooms(data)
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
      <div className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--chat-bg)' }}>
        <div className="text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-white">Loading mchat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--chat-bg)' }}>

      <Sidebar
        rooms={rooms}
        currentRoomId={null}
        user={user}
        onCreateRoom={() => setShowModal(true)}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-8xl">💬</p>
          <h2 className="text-white text-2xl font-light">
            Welcome to mchat
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Select a room from the sidebar to start chatting,
            or create a new room.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 rounded-full text-white text-sm transition"
            style={{ backgroundColor: 'var(--whatsapp-green)' }}
          >
            + Create a Room
          </button>
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-10 text-white bg-gray-700 p-2 rounded-full"
      >
        ☰
      </button>

      {showModal && (
        <CreateRoomModal
          userId={user?.id}
          onRoomCreated={handleRoomCreated}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}