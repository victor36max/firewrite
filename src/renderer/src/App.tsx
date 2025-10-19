import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotesMenu } from './components/NotesMenu'
import { NoteEditor } from './components/NoteEditor'
import { AppLayout } from './components/AppLayout'
import { Chat } from './components/Chat'
import { ToastProvider } from './components/ToastProvider'
import { initTracking } from './services/tracking'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function App(): React.JSX.Element {
  useEffect(() => {
    initTracking()
  }, [])

  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <AppLayout leftSideBar={<NotesMenu />} rightSideBar={<Chat />}>
          <NoteEditor />
        </AppLayout>
      </QueryClientProvider>
    </ToastProvider>
  )
}

export default App
