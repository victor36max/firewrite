import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Editor } from './components/Editor'

const queryClient = new QueryClient()

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4 mx-auto max-w-screen-lg flex flex-col min-h-screen">
        <Editor />
      </div>
    </QueryClientProvider>
  )
}

export default App
