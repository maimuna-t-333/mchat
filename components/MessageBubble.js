export default function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (email) => {
    if (!email) return '?'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">
          {getInitials(message.user_email)}
        </span>
      </div>

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>

        {!isOwn && (
          <span className="text-gray-400 text-xs mb-1 ml-1">
            {message.user_email?.split('@')[0]}
          </span>
        )}

        <div className={`px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-green-600 text-white rounded-br-sm'    
            : 'bg-gray-700 text-white rounded-bl-sm'     
        }`}>
          <p className="text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        <span className="text-gray-500 text-xs mt-1 mx-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}