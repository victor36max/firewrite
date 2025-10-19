import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  safeStorage,
  nativeTheme,
  Menu,
  MenuItem
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

let mainWindow: BrowserWindow | null = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const customizeMenu = () => {
  const currentMenu = Menu.getApplicationMenu()

  if (process.platform !== 'darwin') {
    return
  }

  // Add Settings menu item to Firewrite mac menu
  const appMenu = currentMenu?.items.find((item) => item.label === 'Firewrite')
  if (appMenu) {
    appMenu.submenu?.insert(
      2,
      new MenuItem({
        label: 'Settings',
        click: () => {
          mainWindow?.webContents.send('open-settings')
        },
        accelerator: 'CommandOrControl+,'
      })
    )
    appMenu.submenu?.insert(3, new MenuItem({ type: 'separator' }))
  }

  Menu.setApplicationMenu(currentMenu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  customizeMenu()
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Handler for encrypting a string
  ipcMain.handle('encryptString', async (_event, plainText) => {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption is not available on this platform.')
    }
    const encryptedBuffer = safeStorage.encryptString(plainText)
    return encryptedBuffer.toString('base64') // Convert to base64 for IPC
  })

  // Handler for decrypting a string
  ipcMain.handle('decryptString', async (_event, encryptedBase64) => {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption is not available on this platform.')
    }
    const encryptedBuffer = Buffer.from(encryptedBase64, 'base64')
    return safeStorage.decryptString(encryptedBuffer)
  })

  ipcMain.handle('getTheme', async () => {
    return nativeTheme.themeSource
  })

  ipcMain.handle('getPlatform', async () => {
    return process.platform
  })

  ipcMain.handle('setTheme', async (_event, theme: 'system' | 'light' | 'dark') => {
    nativeTheme.themeSource = theme
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('ready', () => {
  autoUpdater.forceDevUpdateConfig = is.dev
  autoUpdater.checkForUpdatesAndNotify()
})
