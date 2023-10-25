import { BrowserWindow } from 'electron'
import { google } from 'googleapis'

const version = (app: Electron.App) => app.getVersion()

const oauth2Client = new google.auth.OAuth2(
  '258639917596-glojms88bv4mr3cbdsk0t66vs839t6ju.apps.googleusercontent.com', // client id
  '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', // client secret
  'https://app.agenciaboz.com.br' // redirect uri
)

const googleAuth = () => {
  return new Promise((resolve, reject) => {
    console.log('starting google auth process')
    const SCOPES = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/contacts',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.modify'
    ]

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      redirect_uri: 'https://app.agenciaboz.com.br' // Use the custom URI here
    })

    const win = new BrowserWindow({
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: false
      }
    })

    win.loadURL(authUrl)
    win.on('closed', () => {
      console.log('finished google auth process')
      resolve(null)
    })

    win.webContents.on('did-navigate', (_, url) => {
      if (url.startsWith('https://app.agenciaboz.com.br')) {
        const code = new URL(url).searchParams.get('code')
        if (code) {
          oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
              console.error('Error retrieving tokens', err)
              reject(err) // Reject the promise with the error
              win.close()
              return
            }
            if (tokens) {
              oauth2Client.setCredentials(tokens)
              resolve(tokens) // Resolve the promise with the tokens
              win.close()
            }
          })
        }
      }
    })
  })
}

export default { version, googleAuth }
