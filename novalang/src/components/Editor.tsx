import { useCallback } from 'react'
import EditorMonaco from '@monaco-editor/react'

interface EditorProps {
  code: string
  onChange: (code: string) => void
  darkMode: boolean
}

export function Editor({ code, onChange, darkMode }: EditorProps) {
  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }, [onChange])

  return (
    <div className="h-full w-full">
      <EditorMonaco
        height="100%"
        defaultLanguage="novalang"
        language="novalang"
        value={code}
        onChange={handleChange}
        theme={darkMode ? 'vs-dark' : 'vs'}
        options={{
          fontSize: 14,
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          padding: { top: 12 },
          renderWhitespace: 'boundary',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          fontLigatures: true,
        }}
      />
    </div>
  )
}
