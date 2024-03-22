import { User } from 'types/types'

export const UserList = ({
  users,
  loggedUser,
  onStatusChange
}: {
  users: User[]
  loggedUser: User
  onStatusChange: () => void
}) => {
  return (
    <div>
      <h2 className="m-2 text-white">Users:</h2>
      <ul>
        {users?.map((user) => (
          <li key={user.id} className="m-2 text-white">
            {user.name} {user.isHost ? '(Host)' : ''} -{' '}
            {user.role === 'draw' ? '✍' : '🔮'} -
            {user.isReady ? 'Ready' : 'Not ready'}
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
