import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">
          MChat 
        </h1>
        <p className="text-gray-400 text-lg">
          A real-time chat application
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}