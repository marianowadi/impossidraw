import { useEffect, useState } from 'react'
import { useGame } from './GameContextProvider'
import { UserList } from './UserList'
import { User } from 'types/types'
import { socket } from 'api/socket'
import { Canvas } from './Canvas'

export const GameBoard = ({ onLeave }: { onLeave: () => void }) => {
  const { roomState, setRoomState } = useGame()
  const [guess, setGuess] = useState<string>('')
  const loggedUser: User = JSON.parse(
    sessionStorage.getItem('impossidraw_user') as string
  )

  useEffect(() => {
    if (socket) {
      socket.on('roomCreated', (data) => {
        setRoomState(data)
      })

      socket.on('userJoined', (data) => {
        setRoomState((prev) => ({
          ...prev,
          users: data.users,
          roomName: data.roomName
        }))
      })
      socket.on('userUpdate', (data) => {
        setRoomState((prev) => ({
          ...prev,
          users: [...data.users]
        }))
      })
      socket.on('roomStarted', (data) => {
        setRoomState((prev) => ({ ...prev, ...data }))
      })

      socket.on('word', (data) => {
        setRoomState((prev) => ({ ...prev, word: data.word }))
      })

      socket.on('guessFailed', () => setGuess(''))

      socket.on('guessSucceeded', (data) => {
        alert(`Word has been correctly guessed by ${data.user}`)
      })
    }
  }, [socket])

  const handleStartRoom = () => {
    socket.emit('roomStart', { roomName: roomState.roomName })
  }

  const handleStatusChange = () => {
    socket.emit('statusChange', {
      id: loggedUser.id,
      isReady: !loggedUser.isReady,
      roomName: roomState.roomName
    })
  }

  const handleSubmitGuess = () => {
    socket.emit('guessAttempt', {
      id: loggedUser.id,
      roomName: roomState.roomName,
      guess: guess
    })
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex flex-row justify-center">
        {!roomState.isReady ? (
          <div>
            <h1 className="text-2xl font-bold  text-white">
              Waiting for other players <br />
              Room name: {roomState.roomName}
            </h1>
          </div>
        ) : (
          <Canvas />
        )}

        <div className="flex flex-col justify-between border">
          <UserList
            loggedUser={loggedUser}
            onStatusChange={handleStatusChange}
          />
          <button onClick={onLeave} className="m-2  border p-2 text-white">
            Leave
          </button>
          {loggedUser?.isHost && !roomState.isReady && (
            <button
              onClick={handleStartRoom}
              className="m-2 self-center border p-2 text-white"
            >
              Start
            </button>
          )}
        </div>
      </div>
      {roomState.isReady && loggedUser.role === 'guess' ? (
        <div className="flex flex-col">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="my-4 border border-white text-xl"
          />
          <button
            onClick={handleSubmitGuess}
            className="  border p-2 text-white"
          >
            Guess
          </button>
        </div>
      ) : (
        <h1 className="text-3xl text-white">{roomState.word}</h1>
      )}
    </div>
  )
}
