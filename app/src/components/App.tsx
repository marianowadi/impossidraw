import { socket } from 'api/socket'
import { useEffect, useState } from 'react'
import { JoinForm } from './JoinForm'
import { Canvas } from './Canvas'

function App() {
  const [isLogged, setIsLogged] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.close()
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    const values = sessionStorage.getItem('impossidraw_user')
      ? JSON.parse(sessionStorage.getItem('impossidraw_user'))
      : ''
    if (values) {
      setIsLogged(true)
      socket.connect()
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('joinCallback', (data) => {
        sessionStorage.setItem('impossidraw_user', JSON.stringify(data))
      })
    }
  }, [socket])

  const handleOnLeave = () => {
    socket.disconnect()
    setIsLogged(false)
    sessionStorage.removeItem('impossidraw_user')
  }

  return (
    <div className="flex h-lvh  flex-col items-center bg-black pt-6 ">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
        Impossidraw
      </h1>
      {isLogged ? (
        <Canvas onLeave={handleOnLeave} />
      ) : (
        <JoinForm onLoginSubmit={setIsLogged} />
      )}
    </div>
  )
}

export default App
