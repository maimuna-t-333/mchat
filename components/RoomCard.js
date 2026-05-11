import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RoomCard({ room }) {
  const router = useRouter()

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 flex items-center justify-between hover:bg-gray-750 transition">
      <div>
        <h3 className="text-white font-semibold text-lg">
          # {room.name}
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {room.description || 'No description'}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Created {new Date(room.created_at).toLocaleDateString()}
        </p>
      </div>
      <Button
        onClick={() => router.push(`/chat/${room.id}`)}
        className="ml-4"
      >
        Join
      </Button>
    </Card>
  )
}