import { User } from 'types/types'
import { useGame } from './GameContextProvider'

export const UserList = ({
  loggedUser,
  onStatusChange
}: {
  loggedUser: User
  onStatusChange: () => void
}) => {
  const { roomState, setRoomState } = useGame()
  return (
    <div>
      <h2 className="m-2 text-white">Users:</h2>
      <ul>
        {roomState.users?.map((user) => (
          <li key={user.id} className="m-2 text-white">
            {user.name} {user.isHost ? '(Host)' : ''} -{' '}
            {user.role === 'draw' ? '✍' : '🔮'} -
            {roomState.isReady ? '' : user.isReady ? 'Ready' : 'Not ready'}
            {user.points}
            {loggedUser.id === user.id && !user.isReady && (
              <button className="m-2 border p-2" onClick={onStatusChange}>
                I'm ready!
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
