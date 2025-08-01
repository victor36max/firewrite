import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotesMenu } from './components/NotesMenu'
import { NoteEditor } from './components/NoteEditor'

const queryClient = new QueryClient()
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-row w-screen h-screen">
        <div className="w-[300px] h-screen sticky top-0 border-r border-gray-200 overflow-y-auto">
          <NotesMenu />
        </div>
        <div className="flex-1 py-10 px-6 min-h-screen flex">
          <div className="max-w-screen-sm flex flex-col flex-1 mx-auto">
            <NoteEditor />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
