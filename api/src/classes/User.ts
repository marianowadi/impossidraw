import { v4 as uuidv4 } from 'uuid'
import { Role } from '../types/socket'

export class User {
    id: string
    socketId: string
    name: string
    role: Role
    isHost: boolean
    isReady: boolean
    isWinner: boolean
    points: number
    constructor(
        socketId: string,
        name: string,
        role: Role,
        isHost: boolean = false
    ) {
        this.id = uuidv4()
        this.socketId = socketId
        this.name = name
        this.role = role
        this.isHost = isHost
        this.isReady = false
        this.isWinner = false
        this.points = 0
    }
}
