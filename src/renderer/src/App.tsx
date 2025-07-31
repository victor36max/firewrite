import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotesMenu } from './components/NotesMenu'
import { NoteEditor } from './components/NoteEditor'

const queryClient = new QueryClient()
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-row w-screen h-screen">
        <div className="w-[300px] h-screen sticky top-0 border-r border-gray-200">
          <NotesMenu />
        </div>
        <div className="p-10 mx-auto max-w-screen-lg flex flex-col min-h-screen flex-1">
          <NoteEditor />
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
