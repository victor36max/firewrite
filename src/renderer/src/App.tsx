import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotesMenu } from './components/NotesMenu'
import { NoteEditor } from './components/NoteEditor'
import { AppLayout } from './components/AppLayout'
import { Chat } from './components/Chat'

const queryClient = new QueryClient()
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout leftSideBar={<NotesMenu />} rightSideBar={<Chat />}>
        <NoteEditor />
      </AppLayout>
    </QueryClientProvider>
  )
}

export default App
