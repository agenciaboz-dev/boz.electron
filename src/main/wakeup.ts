import axios from 'axios'
import { BrowserWindow } from 'electron'
import { Socket, io } from 'socket.io-client'

declare type HTTPMethods = 'GET' | 'POST'

const request = async (url: string, method: HTTPMethods, data?: string) => {
  console.log({ url, method, data })
  try {
    const response = await axios.request({ method, url, data })
    delete response.request
    return JSON.stringify(response)
  } catch (error: any) {
    console.log(error.response)
    return JSON.stringify({
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    })
  }
}

const send = async (event: string, message: any) => {
  if (socket) {
    socket.emit(event, message)

    return { event, message }
  }
}

const connect = async (
  api: { baseUrl: string; port: string; id: number },
  window: BrowserWindow
) => {
  if (socket) {
    socket.disconnect()
    socket = null
  }

  const url = `${api.baseUrl.replace('http', 'ws')}:${api.port}`
  console.log(url)

  socket = io(url)

  if (socket) {
    socket.on('connect', () => {
      window.webContents.send('socket:connected', api.id)
      console.log({ connected: api.id })
    })

    socket.on('disconnect', () => {
      window.webContents.send('socket:disconnected')
    })

    socket.onAny((event, data) => {
      console.log({ event, data })
      window.webContents.send('socket:event', { event, data })
    })

    return socket.connected
  } else {
    return { error: true }
  }
}

const disconnect = async () => {
  socket?.disconnect()
  socket = null
  console.log(`disconnected: ${{ socket }}`)
}

let socket: Socket | null = null

export default { request, connect, disconnect, send }
