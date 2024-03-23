export type User = {
  name: string
  id: string
  socketId: string
  role: string
  isReady: boolean
  isHost: boolean
  isWinner: boolean
  points: number
}
export type RoomState = {
  roomName: string
  users: Array<User>
  isReady: boolean
  isFinished: boolean
  word?: string
}
