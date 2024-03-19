import { useState } from 'react'
import { socket } from '../api/socket'

export const JoinForm = ({
  onLoginSubmit
}: {
  onLoginSubmit: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [mode, setMode] = useState<'host' | 'participant' | null>(null)
  const [userData, setUserData] = useState<{
    name: string
    role: string
    room?: string
  }>({
    name: '',
    role: '',
    room: ''
  })
  const isSubmitDisabled =
    !mode || !userData.name || (mode === 'participant' && !userData.room)
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    socket.connect()
    socket.emit('userData', userData)
    onLoginSubmit(true)
    sessionStorage.setItem('impossidraw_user', JSON.stringify(userData))
  }
  if (!mode) {
    return (
      <div className="flex flex-col pt-12">
        <div className="flex flex-col">
          <div className="my-4 flex flex-row justify-between">
            <button
              className="cursor-pointer p-2 text-2xl text-white hover:bg-white hover:text-black"
              onClick={() => setMode('participant')}
            >
              Join room
            </button>

            <button
              className="cursor-pointer p-2 text-2xl text-white hover:bg-white hover:text-black"
              onClick={() => setMode('host')}
            >
              Create room
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col pt-12">
      {mode === 'host' ? (
        <>
          <div className="flex flex-col">
            <h2 className="text-white">I want to:</h2>
            <div className="my-4 flex flex-row justify-between">
              <button
                className={`cursor-pointer p-2 text-2xl text-white hover:bg-white hover:text-black ${
                  userData.role === 'guess' ? 'border' : ''
                }`}
                onClick={() =>
                  setUserData((prev) => ({ ...prev, role: 'guess' }))
                }
              >
                Guess
              </button>

              <button
                className={`cursor-pointer p-2 text-2xl text-white hover:bg-white hover:text-black ${
                  userData.role === 'draw' ? 'border' : ''
                }`}
                onClick={() =>
                  setUserData((prev) => ({ ...prev, role: 'draw' }))
                }
              >
                Draw
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col">
            <h2 className="text-white">I want to:</h2>
            <div className="my-4 flex flex-row justify-between">
              <button
                className={`cursor-pointer p-2 text-2xl text-white hover:bg-white hover:text-black ${
                  userData.role === 'guess' ? 'border-white' : 'border-black'
                }`}
                onClick={() =>
                  setUserData((prev) => ({ ...prev, role: 'guess' }))
                }
              >
                Guess
              </button>

              <button
                className={`cursor-pointer border p-2 text-2xl text-white hover:bg-white hover:text-black ${
                  userData.role === 'draw' ? 'border-white' : 'border-black'
                }`}
                onClick={() =>
                  setUserData((prev) => ({ ...prev, role: 'draw' }))
                }
              >
                Draw
              </button>
            </div>
          </div>
          <h2 className="text-white">Enter your name:</h2>
          <form className="flex flex-col" onSubmit={handleNameSubmit}>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <button
              type="submit"
              className="mt-4 rounded-md bg-white p-2 text-black disabled:cursor-not-allowed disabled:bg-gray-500"
              title={isSubmitDisabled ? 'Enter role, name and room' : ''}
              disabled={isSubmitDisabled}
            >
              Join
            </button>
          </form>
        </>
      )}
      <button
        className="mt-4 rounded-md bg-white p-2 text-black"
        onClick={() => setMode(null)}
      >
        Go back
      </button>
    </div>
  )
}
