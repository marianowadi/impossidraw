import { ReactNode, createContext, useContext, useState } from 'react'
import { RoomState } from 'types/types'

const GameContext = createContext<
  | {
      roomState: RoomState
      setRoomState: React.Dispatch<React.SetStateAction<RoomState>>
    }
  | undefined
>(undefined)

const GameContextProvider = ({ children }: { children: ReactNode }) => {
  const [roomState, setRoomState] = useState<RoomState>({
    roomName: '',
    word: undefined,
    users: [],
    isReady: false,
    isFinished: false
  })
  const value = { roomState, setRoomState }
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameContextProvider')
  }
  return context
}

export { GameContextProvider, useGame }
