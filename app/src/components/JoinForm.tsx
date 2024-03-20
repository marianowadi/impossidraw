import { useState } from 'react'
import { socket } from '../api/socket'

export const JoinForm = ({
  onLoginSubmit
}: {
  onLoginSubmit: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [mode, setMode] = useState<'host' | 'participant' | null>(null)
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
          <HostForm onLoginSubmit={onLoginSubmit} />
        </>
      ) : (
        <ParticipantForm onLoginSubmit={onLoginSubmit} />
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

const HostForm = ({
  onLoginSubmit
}: {
  onLoginSubmit: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [role, setRole] = useState<null | 'guess' | 'draw'>(null)
  const [name, setName] = useState<string>('')
  const isSubmitDisabled = !name || !role

  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    socket.connect()
    const userData = { name, role }
    socket.emit('createRoom', userData)
    sessionStorage.setItem('impossidraw_user', JSON.stringify(userData))
    onLoginSubmit(true)
  }

  return (
    <div className="flex flex-col">
      <RoleForm role={role} onRoleChange={setRole} />
      <form className="flex flex-col" onSubmit={handleHostSubmit}>
        <h2 className="mt-4 text-white">Enter your name:</h2>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          type="submit"
          className="mt-4 rounded-md bg-white p-2 text-black disabled:cursor-not-allowed disabled:bg-gray-500"
          title={isSubmitDisabled ? 'Enter role and name' : ''}
          disabled={isSubmitDisabled}
        >
          Create
        </button>
      </form>
    </div>
  )
}
const ParticipantForm = ({
  onLoginSubmit
}: {
  onLoginSubmit: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [role, setRole] = useState<null | 'guess' | 'draw'>(null)
  const [userData, setUserData] = useState<{
    name: string
    role: string
    room: string
  }>({
    name: '',
    role: '',
    room: ''
  })
  const isSubmitDisabled = !userData.name || !userData.room
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    socket.connect()
    socket.emit('userData', userData)
    onLoginSubmit(true)
    sessionStorage.setItem('impossidraw_user', JSON.stringify(userData))
  }
  return (
    <div className="flex flex-col">
      <RoleForm role={role} onRoleChange={setRole} />
      <h2 className="text-white">Enter your name:</h2>
      <form className="flex flex-col" onSubmit={handleNameSubmit}>
        <input
          type="text"
          name="room"
          value={userData.room}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, room: e.target.value }))
          }
        />

        <h2 className="mt-4 text-white">Enter room name:</h2>
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
    </div>
  )
}

const RoleForm = ({
  role,
  onRoleChange
}: {
  role: 'guess' | 'draw' | null
  onRoleChange: React.Dispatch<React.SetStateAction<'guess' | 'draw' | null>>
}) => {
  return (
    <>
      <h2 className="text-white">I want to:</h2>
      <div className="my-4 flex flex-row justify-between">
        <button
          className={`cursor-pointer border p-2 text-2xl text-white hover:bg-white hover:text-black ${
            role === 'guess' ? 'border-white' : 'border-black'
          }`}
          onClick={() => onRoleChange('guess')}
        >
          Guess
        </button>

        <button
          className={`cursor-pointer border p-2 text-2xl text-white hover:bg-white hover:text-black ${
            role === 'draw' ? 'border-white' : 'border-black'
          }`}
          onClick={() => onRoleChange('draw')}
        >
          Draw
        </button>
      </div>
    </>
  )
}
