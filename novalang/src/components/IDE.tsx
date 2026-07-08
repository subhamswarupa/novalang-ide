import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Trash2, Sun, Moon, FileCode,
  ChevronDown, BookOpen, Timer, List, Zap, ExternalLink
} from 'lucide-react'
import { Editor } from './Editor'
import { OutputPanel } from './Output'
import { DocsPanel } from './Docs'
import { examples, type Example } from '../data/examples'
import { runNovaLang } from '../engine'
import type { RuntimeError } from '../engine/types'
import type { OutputEntry } from './types'

const defaultCode = `# Welcome to NovaLang!
# Try running this FizzBuzz example

FOR i = 1 TO 15
  IF i % 15 == 0
    PRINT "FizzBuzz"
  ELSE
    IF i % 3 == 0
      PRINT "Fizz"
    ELSE
      IF i % 5 == 0
        PRINT "Buzz"
      ELSE
        PRINT i
      END
    END
  END
END`

export function IDE() {
  const [code, setCode] = useState(defaultCode)
  const [output, setOutput] = useState<OutputEntry[]>([])
  const [darkMode, setDarkMode] = useState(true)
  const [showExplorer, setShowExplorer] = useState(true)
  const [showDocs, setShowDocs] = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [running, setRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const [variables, setVariables] = useState<Record<string, unknown>>({})
  const [currentExample, setCurrentExample] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string>('main.nl')

  const addOutput = useCallback((text: string, type: OutputEntry['type'] = 'output') => {
    setOutput(prev => [...prev, { text, type }])
  }, [])

  const clearOutput = useCallback(() => {
    setOutput([])
  }, [])

  const handleRun = useCallback(async () => {
    setRunning(true)
    clearOutput()

    const startTime = performance.now()

    const result = await runNovaLang(code)

    const elapsed = performance.now() - startTime
    setExecutionTime(elapsed)
    setVariables(result.variables)

    if (result.errors.length > 0) {
      for (const err of result.errors) {
        const errMsg = formatRuntimeError(err)
        addOutput(errMsg, 'error')
      }
    }

    if (result.output.length > 0) {
      for (const line of result.output) {
        addOutput(line, 'output')
      }
    } else if (result.errors.length === 0) {
      addOutput('Program executed successfully (no output)', 'info')
    }

    setRunning(false)
  }, [code, addOutput, clearOutput])

  const handleClear = useCallback(() => {
    clearOutput()
    setExecutionTime(0)
    setVariables({})
  }, [clearOutput])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }, [handleRun])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const loadExample = useCallback((example: Example) => {
    setCode(example.code)
    setCurrentExample(example.name)
    clearOutput()
    setActiveItem(example.name.toLowerCase().replace(/\s+/g, '-') + '.nl')
  }, [clearOutput])

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Title Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--accent-orange)]" />
            <span className="font-bold text-sm text-[var(--text-primary)]">NovaLang</span>
          </div>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">IDE v1.0</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] hidden md:inline">
            Ctrl+Enter to run
          </span>
          <button
            onClick={() => setShowDocs(!showDocs)}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              showDocs ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
            title="GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Explorer Sidebar */}
        <AnimatePresence>
          {showExplorer && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Explorer</span>
                </div>
                <button
                  onClick={() => setActiveItem('main.nl')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all duration-150 ${
                    activeItem === 'main.nl'
                      ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <FileCode className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">main.nl</span>
                </button>

                <div className="mt-4">
                  <div className="flex items-center gap-1 mb-2">
                    <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Examples</span>
                  </div>
                  <div className="space-y-0.5">
                    {examples.map((ex) => (
                      <button
                        key={ex.name}
                        onClick={() => loadExample(ex)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all duration-150 ${
                          currentExample === ex.name
                            ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                        <span className="truncate text-xs">{ex.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowExplorer(!showExplorer)}
                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
                title="Toggle Explorer"
              >
                <List className="w-4 h-4" />
              </button>
              <span className="text-xs text-[var(--text-muted)] ml-2">
                {activeItem}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {executionTime > 0 && (
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {executionTime.toFixed(1)}ms
                </span>
              )}
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--accent-green)] text-white hover:bg-[var(--accent-green)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[var(--accent-green)]/20"
              >
                {running ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{running ? 'Running...' : 'Run'}</span>
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              code={code}
              onChange={setCode}
              darkMode={darkMode}
            />
          </div>

          {/* Output Panel */}
          <OutputPanel
            output={output}
            onClear={clearOutput}
            executionTime={executionTime}
            variables={variables}
            showVariables={showVariables}
            onToggleVariables={() => setShowVariables(!showVariables)}
          />
        </div>

        {/* Documentation Panel */}
        <AnimatePresence>
          {showDocs && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-y-auto flex-shrink-0"
            >
              <DocsPanel onClose={() => setShowDocs(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatRuntimeError(err: RuntimeError): string {
  const hints: Record<string, string> = {
    'Undefined variable': 'Did you forget to declare it with LET?',
    'Division by zero': 'Cannot divide by zero.',
    'Infinite loop': 'Check your loop condition.',
    'Undefined function': 'Define the function before calling it.',
  }
  for (const [key, hint] of Object.entries(hints)) {
    if (err.message.includes(key)) {
      return `[Line ${err.line}] ${err.message}\n  \uD83D\uDCA1 ${hint}`
    }
  }
  return `[Line ${err.line}] ${err.message}`
}
