import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  safeStorage,
  nativeTheme,
  Menu,
  MenuItem,
  screen
} from 'electron'
import { join } from 'path'
import fs from 'fs'
import debounce from 'lodash/debounce.js'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

let mainWindow: BrowserWindow | null = null

type WindowState = {
  bounds: { x: number; y: number; width: number; height: number }
  isMaximized: boolean
  isFullScreen: boolean
}

const WINDOW_STATE_FILENAME = 'window-state.json'
const WINDOW_STATE_SAVE_DEBOUNCE_MS = 300

const getWindowStatePath = () => join(app.getPath('userData'), WINDOW_STATE_FILENAME)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isValidBounds = (
  bounds: WindowState['bounds'] | undefined
): bounds is WindowState['bounds'] =>
  !!bounds &&
  isFiniteNumber(bounds.x) &&
  isFiniteNumber(bounds.y) &&
  isFiniteNumber(bounds.width) &&
  isFiniteNumber(bounds.height) &&
  bounds.width > 0 &&
  bounds.height > 0

const toBoolean = (value: unknown) => value === true

const readWindowState = (): WindowState | null => {
  try {
    const raw = fs.readFileSync(getWindowStatePath(), 'utf-8')
    const state = JSON.parse(raw) as WindowState
    if (!isValidBounds(state?.bounds)) return null
    return {
      bounds: state.bounds,
      isMaximized: toBoolean(state?.isMaximized),
      isFullScreen: toBoolean(state?.isFullScreen)
    }
  } catch {
    return null
  }
}

const isBoundsVisible = (bounds: WindowState['bounds']) => {
  if (!isValidBounds(bounds)) return false
  try {
    const { x, y, width, height } = bounds
    const display = screen.getDisplayMatching(bounds)
    const { workArea } = display
    const withinHorizontal = x + width > workArea.x && x < workArea.x + workArea.width
    const withinVertical = y + height > workArea.y && y < workArea.y + workArea.height
    return withinHorizontal && withinVertical
  } catch {
    return false
  }
}

const clampBoundsToDisplay = (bounds: WindowState['bounds']) => {
  const display = (() => {
    try {
      return screen.getDisplayMatching(bounds)
    } catch {
      return screen.getPrimaryDisplay()
    }
  })()
  const { workArea } = display
  const width = Math.min(bounds.width, workArea.width)
  const height = Math.min(bounds.height, workArea.height)
  const x = Math.min(Math.max(bounds.x, workArea.x), workArea.x + workArea.width - width)
  const y = Math.min(Math.max(bounds.y, workArea.y), workArea.y + workArea.height - height)
  return { x, y, width, height }
}

const writeWindowState = (window: BrowserWindow) => {
  const isMaximized = window.isMaximized()
  const isFullScreen = window.isFullScreen()
  const bounds = isMaximized || isFullScreen ? window.getNormalBounds() : window.getBounds()
  const state: WindowState = { bounds, isMaximized, isFullScreen }
  try {
    fs.writeFileSync(getWindowStatePath(), JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to persist window state', error)
  }
}

function createWindow() {
  const savedState = readWindowState()
  const shouldRestoreBounds = savedState && isBoundsVisible(savedState.bounds)
  const restoredBounds =
    savedState && shouldRestoreBounds ? clampBoundsToDisplay(savedState.bounds) : null
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: restoredBounds ? restoredBounds.width : 900,
    height: restoredBounds ? restoredBounds.height : 670,
    ...(restoredBounds ? { x: restoredBounds.x, y: restoredBounds.y } : {}),
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (savedState?.isMaximized) {
      mainWindow?.maximize()
    }
    if (savedState?.isFullScreen) {
      mainWindow?.setFullScreen(true)
    }
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Zoom-out accelerator can be dropped by the menu on some keyboard layouts.
  // This fallback ensures Cmd/Ctrl + '-' (or '_') still reduces zoom.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const isCmdOrCtrl = input.meta || input.control
    if (!isCmdOrCtrl) return
    if (input.key !== '-' && input.key !== '_' && input.key !== 'Minus') return

    event.preventDefault()
    const currentZoom = mainWindow?.webContents.getZoomLevel() ?? 0
    const nextZoom = Math.max(-3, currentZoom - 0.5)
    mainWindow?.webContents.setZoomLevel(nextZoom)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const saveState = debounce(() => {
    if (!mainWindow) return
    writeWindowState(mainWindow)
  }, WINDOW_STATE_SAVE_DEBOUNCE_MS)

  mainWindow.on('resize', saveState)
  mainWindow.on('move', saveState)
  mainWindow.on('close', saveState)
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
