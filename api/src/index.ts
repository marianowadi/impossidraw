import { Server } from 'socket.io'
import express, { Express, Request, Response } from 'express'
import http from 'http'

class Room {
    #name: string
    #users: Array<Record<string, string | boolean>> = []
    #isReady: boolean = false
    constructor(name: string) {
        this.#name = name
    }

    getInfo() {
        return {
            name: this.#name,
            isReady: this.#isReady,
            users: this.#users,
        }
    }

    addUser({
        id,
        name,
        role,
        isHost = false,
    }: {
        id: string
        name: string
        role: string
        isHost: boolean
    }) {
        if (!users.find((user) => user.name === name)) {
            users.push({
                id: id,
                name: name,
                role: role,
                isHost: isHost,
            })
        }
    }

    setIsReady() {
        this.#isReady = true
    }
}

const app = express()
const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    },
})
const PORT = 5009
const users: Array<Record<string, string | boolean>> = []

io.on('connection', function (socket) {
    console.log('A user has connected :', socket.id)

    socket.on('createRoom', (data) => {
        // Generate random room name
        const roomName = 'brave-prairie-dogs'
        const room = new Room(roomName)
        room.addUser({
            id: socket.id,
            name: data.name,
            role: data.role,
            isHost: true,
        })
        console.log(data)
        const { name, isReady, users } = room.getInfo()
        socket.join(name)
        io.to(name).emit('roomCreated', {
            roomName: name,
            isReady: isReady,
            users: users,
        })
    })

    socket.on('canvasImage', (data) => {
        socket.broadcast.emit('canvasImage', data)
    })
    socket.on('userData', (data) => {
        console.log(data)
        if (!users.find((user) => user.name === data.name)) {
            users.push({
                id: socket.id,
                name: data.name,
                role: data.role,
            })
        }

        console.log(users)
        io.emit('sessionUsers', users)
    })
})

// Start the WebSocket server
server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`)
})
