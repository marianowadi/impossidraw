import { Server } from 'socket.io'
import express, { Express, Request, Response } from 'express'
import http from 'http'

const app = express()
const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    },
})
const PORT = 5000
const users: Array<Record<string, string>> = []

io.on('connection', function (socket) {
    console.log('A user has connected :', socket.id)

    socket.on('createRoom', (data) => {
        console.log(data)
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
