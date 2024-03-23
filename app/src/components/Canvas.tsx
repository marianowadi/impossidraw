import { useEffect, useRef } from 'react'
import { socket } from '../api/socket'

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    const ctx = canvasRef.current?.getContext('2d')

    if (!canvas) return

    // Variables to store drawing state
    let isDrawing = false
    let lastX = 0
    let lastY = 0

    const startDrawing = (e: { offsetX: number; offsetY: number }) => {
      isDrawing = true
      ;[lastX, lastY] = [e.offsetX, e.offsetY]
    }

    // Function to draw
    const draw = (e: { offsetX: number; offsetY: number }) => {
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(e.offsetX, e.offsetY)
        ctx.stroke()
      }

      ;[lastX, lastY] = [e.offsetX, e.offsetY]
    }

    // Function to end drawing
    const endDrawing = () => {
      const dataURL = canvas.toDataURL() // Get the data URL of the canvas content

      // Send the dataURL or image data to the socket
      if (socket) {
        socket.emit('canvasImage', dataURL)
      }
      isDrawing = false
    }

    // Set initial drawing styles
    if (ctx) {
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 5

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDrawing)
    canvas.addEventListener('mouseout', endDrawing)

    return () => {
      // Clean up event listeners when component unmounts
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', endDrawing)
      canvas.removeEventListener('mouseout', endDrawing)
    }
  }, [])
  useEffect(() => {
    if (socket) {
      // Event listener for receiving canvas data from the socket
      socket.on('canvasImage', (data) => {
        // Create an image object from the data URL
        const image = new Image()
        image.src = data

        const canvas = canvasRef.current
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const ctx = canvas?.getContext('2d')
        // Draw the image onto the canvas
        image.onload = () => {
          ctx?.drawImage(image, 0, 0)
        }
      })

      socket.on('guessSucceeded', () => {
        const canvas = canvasRef.current
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const ctx = canvas?.getContext('2d')
        ctx?.clearRect(0, 0, 800, 600)
      })
    }
  }, [socket])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        backgroundColor: 'white'
      }}
    />
  )
}
