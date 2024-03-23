import { WORDS } from '../constants'
import { User } from '../types/socket'
import { getRandomValue } from '../utils'

export class Room {
    #name: string
    #users: Array<User> = []
    #isReady: boolean = false
    #word: string
    #goal: number = 150
    constructor(name: string) {
        this.#name = name
        this.#word = WORDS[getRandomValue(WORDS.length)]
    }

    getInfo() {
        return {
            name: this.#name,
            isReady: this.#isReady,
            users: this.#users,
        }
    }

    getWord() {
        return this.#word
    }

    getRoomName() {
        return this.#name
    }

    addUser({
        id,
        socketId,
        name,
        role,
        isReady = false,
        isHost = false,
    }: User) {
        if (!this.#users.find((user) => user.name === name)) {
            this.#users.push({
                id: id,
                socketId: socketId,
                name: name,
                role: role,
                isHost: isHost,
                isReady: isReady,
                points: 0,
            })
        }
    }

    updateUser({ id, isReady }: { id: string; isReady: boolean }) {
        const users = [...this.#users]
        this.#users = users.map((user) => {
            if (user.id === id) {
                return {
                    ...user,
                    isReady: isReady,
                }
            } else {
                return user
            }
        })
    }

    setIsReady() {
        this.#isReady = true
    }

    updateScores({ userId, points }: { userId: string; points: number }) {
        const users = [...this.#users]
        this.#users = users.map((user) => {
            if (user.id === userId || user.role === 'draw') {
                return {
                    ...user,
                    points: user.points + points,
                }
            } else {
                return user
            }
        })
    }

    checkGuess(value: string) {
        return value === this.#word
    }
}
