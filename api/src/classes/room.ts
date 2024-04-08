import { WORDS } from '../constants'
import { User } from '../types/socket'
import { getRandomValue } from '../utils'

export class Room {
    #name: string
    users: Array<User> = []
    #isReady: boolean = false
    #word: string
    #goal: number = 40
    #isFinished: boolean = false
    constructor(name: string) {
        this.#name = name
        this.#word = WORDS[getRandomValue(WORDS.length)]
    }

    getInfo() {
        return {
            name: this.#name,
            isReady: this.#isReady,
            isFinished: this.#isFinished,
            users: this.users,
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
        if (!this.users.find((user) => user.name === name)) {
            this.users.push({
                id: id,
                socketId: socketId,
                name: name,
                role: role,
                isHost: isHost,
                isReady: isReady,
                isWinner: false,
                points: 0,
            })
        }
    }

    removeUser(userId: string) {
        const users = [...this.users]
        this.users = users.filter((user) => user.id !== userId)
    }

    updateUser({ id, isReady }: { id: string; isReady: boolean }) {
        const users = [...this.users]
        this.users = users.map((user) => {
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
        const users = [...this.users]
        this.users = users.map((user) => {
            if (user.id === userId || user.role === 'draw') {
                const newPoints = user.points + points
                return {
                    ...user,
                    points: newPoints,
                    isWinner: newPoints >= this.#goal ? true : false,
                }
            } else {
                return user
            }
        })
    }

    hasWinner() {
        const winner = this.users.find((user) => user.isWinner)
        if (winner) this.#isFinished = true
        return winner
    }

    renewWord() {
        const previousWord = this.#word
        const newWord = this.#getNewWord()
        if (previousWord === newWord) {
            this.renewWord()
        } else {
            this.#word = newWord
        }
    }

    checkGuess(value: string) {
        return value === this.#word
    }

    #getNewWord() {
        return WORDS[getRandomValue(WORDS.length)]
    }
}
