import { io } from 'socket.io-client'

const URL = 'http://localhost:5009'

export const socket = io(URL, {
  autoConnect: false
})
