'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Sidebar({
  rooms,
  currentRoomId,
  user,
  onCreateRoom,
  onLogout,
  isOpen,
  onClose
}) {
  const router = useRouter()
  const getInitials = (email) => {
    if (!email) return '?'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:relative z-30 md:z-auto
        w-80 h-full flex flex-col
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-gray-700"
          style={{ backgroundColor: 'var(--message-bg)' }}
        >
          <div className="flex items-center gap-3">
            {/* User avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: 'var(--whatsapp-teal)' }}>
              {getInitials(user?.email)}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {user?.email?.split('@')[0]}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-400 text-xs transition"
          >
            Logout
          </button>
        </div>

        <div className="px-3 py-2" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--input-bg)' }}>
            <span className="text-gray-400 text-sm">🔍</span>
            <span className="text-gray-400 text-sm">Search or start new chat</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No rooms yet</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  router.push(`/chat/${room.id}`)
                  onClose?.()
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 cursor-pointer
                  border-b border-gray-800 transition
                  ${currentRoomId === room.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                  }
                `}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: 'var(--whatsapp-dark-green)' }}
                >
                  {room.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm truncate">
                      # {room.name}
                    </p>
                    <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                      {new Date(room.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {room.description || 'No description'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700"
          style={{ backgroundColor: 'var(--message-bg)' }}>
          <Button
            onClick={onCreateRoom}
            className="w-full text-white font-medium"
            style={{ backgroundColor: 'var(--whatsapp-green)' }}
          >
            + New Room
          </Button>
        </div>
      </div>
    </>
  )
}