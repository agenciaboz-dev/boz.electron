import { BrowserWindow } from 'electron'
import { google } from 'googleapis'

const version = (app: Electron.App) => app.getVersion()

const { protocol } = require('electron')

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'electron-app-auth',
    privileges: {
      secure: true,
      standard: true
    }
  }
])

const googleAuth = async () => {
  const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.modify'
  ]

  const oauth2Client = new google.auth.OAuth2(
    '258639917596-glojms88bv4mr3cbdsk0t66vs839t6ju.apps.googleusercontent.com', // client id
    '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', // client secret
    'electron-app-auth://oauth-callback' // redirect uri
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })

  const win = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  })

  win.loadURL(authUrl)
  try {
    const url = await new Promise<string>((resolve) => {
      win.webContents.on('will-navigate', (_event, url) => {
        resolve(url)
      })
    })

    if (url.startsWith('https://app.agenciaboz.com.br')) {
      const code = new URL(url).searchParams.get('code')
      if (code) {
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        // Handle successful authentication
        console.log('Authentication successful:', tokens)
        return tokens
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
  } finally {
    win.close()
  }
  return false
}

export default { googleAuth, version }
