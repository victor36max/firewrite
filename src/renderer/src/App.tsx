import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotesMenu } from './components/NotesMenu'
import { NoteEditor } from './components/NoteEditor'
import { AppLayout } from './components/AppLayout'

const queryClient = new QueryClient()
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout sideBar={<NotesMenu />}>
        <NoteEditor />
      </AppLayout>
    </QueryClientProvider>
  )
}

export default App
