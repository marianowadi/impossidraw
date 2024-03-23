export type Role = 'guess' | 'draw'

export type User = {
    id: string
    socketId: string
    name: string
    points: number
    role: Role
    isReady: boolean
    isHost: boolean
    isWinner: boolean
}
