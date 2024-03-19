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

  const handleOnLeave = () => {
    socket.disconnect()
    setIsLogged(false)
    sessionStorage.removeItem('impossidraw_user')
  }
  return (
    <div className="bg-black h-screen flex flex-col items-center pt-24 ">
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
