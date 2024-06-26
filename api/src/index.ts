import { Server } from 'socket.io'
import express, { Express, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import http from 'http'
import { Role } from './types/socket'
import { SOCKET_EVENTS } from './constants'
import { Room } from './classes/room'
import { User } from './classes/User'

const app = express()
const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    },
})
const PORT = 5009
let rooms: Array<Room> = []

io.on(SOCKET_EVENTS.CONNECTION, function (socket) {
    console.log('A user has connected :', socket.id)

    socket.on(
        SOCKET_EVENTS.CREATE_ROOM,
        (data: { name: string; role: Role }) => {
            const roomName = 'room'
            const room = new Room(roomName)
            const newUser = new User(socket.id, data.name, data.role, true)
            room.addUser(newUser)
            rooms.push(room)
            const { name, isReady, users } = room.getInfo()
            socket.join(name)
            if (newUser.role === 'draw') {
                socket.join(`${roomName}-draw`)
            }
            socket.emit(SOCKET_EVENTS.JOIN_CALLBACK, newUser)
            io.to(name).emit(SOCKET_EVENTS.ROOM_CREATED, {
                roomName: name,
                isReady: isReady,
                users: users,
            })
        }
    )

    socket.on(
        SOCKET_EVENTS.JOIN_ROOM,
        (data: { name: string; role: Role; roomName: string }) => {
            const { name, role, roomName } = data
            const existingRoom = rooms.find(
                (room) => room.getRoomName() === roomName
            )
            if (!existingRoom) throw Error('Room not found')
            const newUser = new User(socket.id, name, role)
            if (newUser.role === 'draw') {
                socket.join(`${roomName}-draw`)
            }
            existingRoom.addUser(newUser)
            const { users } = existingRoom.getInfo()
            socket.join(roomName)
            socket.emit(SOCKET_EVENTS.JOIN_CALLBACK, newUser)
            io.to(roomName).emit('userJoined', {
                users: users,
                roomName: roomName,
            })
        }
    )

    socket.on(
        SOCKET_EVENTS.STATUS_CHANGE,
        (data: { id: string; isReady: boolean; roomName: string }) => {
            const { id, isReady, roomName } = data
            const existingRoom = rooms.find(
                (room) => room.getRoomName() === roomName
            )
            if (!existingRoom) throw Error('Room not found')
            existingRoom.updateUser({ id, isReady })
            const { users } = existingRoom.getInfo()
            io.to(roomName).emit('userUpdate', {
                users: users,
            })
        }
    )

    socket.on(SOCKET_EVENTS.ROOM_START, (data: { roomName: string }) => {
        const existingRoom = rooms.find(
            (room) => room.getRoomName() === data.roomName
        )
        if (!existingRoom) throw Error('Room not found')
        existingRoom.setIsReady()
        const roomData = existingRoom.getInfo()
        io.to(`${data.roomName}-draw`).emit('word', {
            word: existingRoom.getWord(),
        })
        io.to(data.roomName).emit(SOCKET_EVENTS.ROOM_STARTED, roomData)
    })

    socket.on(SOCKET_EVENTS.CANVAS_IMAGE, (data: any) => {
        socket.broadcast.emit(SOCKET_EVENTS.CANVAS_IMAGE, data)
    })

    socket.on(
        SOCKET_EVENTS.GUESS_ATTEMPT,
        (data: { roomName: string; userId: string; guess: string }) => {
            const { guess, userId, roomName } = data
            const existingRoom = rooms.find(
                (room) => room.getRoomName() === roomName
            )
            if (!existingRoom) throw Error('Room not found')
            const attemptResult = existingRoom.checkGuess(guess)
            if (attemptResult) {
                // Drawers and guessee earn points
                existingRoom.updateScores({ userId, points: 20 })

                // Check if user has won
                const winner = existingRoom.hasWinner()
                const { users, isFinished } = existingRoom.getInfo()

                if (winner) {
                    io.to(roomName).emit(SOCKET_EVENTS.PLAYER_WON, {
                        users: users,
                        isFinished: isFinished,
                    })
                } else {
                    existingRoom.renewWord()
                    io.to(roomName).emit(SOCKET_EVENTS.GUESS_SUCCEEDED, {
                        status: 'success',
                        user: userId,
                        users: users,
                    })
                    io.to(`${data.roomName}-draw`).emit('word', {
                        word: existingRoom.getWord(),
                    })
                }
            } else {
                socket.emit(SOCKET_EVENTS.GUESS_FAILED)
            }
        }
    )

    socket.on('disconnect', () => {
        console.log('Socket disconnected: ', socket.id)
        const userRoom = rooms.find((room) =>
            room.users.find((user) => user.socketId === socket.id)
        )
        if (!userRoom) return
        const user = userRoom.users.find((user) => user.socketId === socket.id)
        if (!user) return
        if (user.isHost) {
            // 1. Disconnect everybody in room
            io.in(userRoom.getRoomName()).disconnectSockets(true)
            // 2. Delete room from array
            deleteRoom(userRoom.getRoomName())
        } else {
            // 1. Remove user from room users
            userRoom.removeUser(user.id)
            // 2. Leave room
            socket.leave(userRoom.getRoomName())
        }
    })
})

// Start the WebSocket server
server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`)
})

function deleteRoom(roomName: string) {
    const filteredRooms = rooms.filter(
        (room) => room.getRoomName() !== roomName
    )
    rooms = filteredRooms
}
