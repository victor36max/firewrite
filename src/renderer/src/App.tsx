import { MarkdownEditor } from './components/MarkdownEditor'

function App(): React.JSX.Element {
  return (
    <div className="p-4 mx-auto max-w-screen-lg flex flex-col min-h-screen">
      <MarkdownEditor />
    </div>
  )
}

export default App
