import { useEffect, useRef, useState } from 'react'
import { socket } from '../api/socket'
import { RoomState, User } from 'types/types'
import { UserList } from './UserList'

export const Canvas = ({ onLeave }: { onLeave: () => void }) => {
  const [roomState, setRoomState] = useState<RoomState>({
    roomName: '',
    word: undefined,
    users: [],
    isReady: false
  })
  const [guess, setGuess] = useState<string>('')
  const loggedUser: User = JSON.parse(
    sessionStorage.getItem('impossidraw_user') as string
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    const ctx = canvasRef.current?.getContext('2d')

    if (!canvas) return

    // Variables to store drawing state
    let isDrawing = false
    let lastX = 0
    let lastY = 0

    const startDrawing = (e: { offsetX: number; offsetY: number }) => {
      isDrawing = true
      ;[lastX, lastY] = [e.offsetX, e.offsetY]
    }

    // Function to draw
    const draw = (e: { offsetX: number; offsetY: number }) => {
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(e.offsetX, e.offsetY)
        ctx.stroke()
      }

      ;[lastX, lastY] = [e.offsetX, e.offsetY]
    }

    // Function to end drawing
    const endDrawing = () => {
      const dataURL = canvas.toDataURL() // Get the data URL of the canvas content

      // Send the dataURL or image data to the socket
      if (socket) {
        socket.emit('canvasImage', dataURL)
      }
      isDrawing = false
    }

    // Set initial drawing styles
    if (ctx) {
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 5

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDrawing)
    canvas.addEventListener('mouseout', endDrawing)

    return () => {
      // Clean up event listeners when component unmounts
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', endDrawing)
      canvas.removeEventListener('mouseout', endDrawing)
    }
  }, [])
  useEffect(() => {
    if (socket) {
      // Event listener for receiving canvas data from the socket
      socket.on('canvasImage', (data) => {
        console.log(data)
        // Create an image object from the data URL
        const image = new Image()
        image.src = data

        const canvas = canvasRef.current
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const ctx = canvas?.getContext('2d')
        // Draw the image onto the canvas
        image.onload = () => {
          ctx?.drawImage(image, 0, 0)
        }
      })

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
        {!roomState.isReady && (
          <div>
            <h1 className="text-2xl font-bold  text-white">
              Waiting for other players <br />
              Room name: {roomState.roomName}
            </h1>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={roomState.isReady ? 800 : 0}
          height={roomState.isReady ? 600 : 0}
          style={{
            backgroundColor: 'white'
          }}
        />

        <div className="flex flex-col justify-between border">
          <UserList
            users={roomState.users}
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
