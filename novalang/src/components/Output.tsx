import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Eye, EyeOff, Terminal, Timer } from 'lucide-react'
import type { OutputEntry } from './types'

interface OutputPanelProps {
  output: OutputEntry[]
  onClear: () => void
  executionTime: number
  variables: Record<string, unknown>
  showVariables: boolean
  onToggleVariables: () => void
}

export function OutputPanel({
  output,
  onClear,
  executionTime,
  variables,
  showVariables,
  onToggleVariables,
}: OutputPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  return (
    <motion.div
      initial={{ height: 120 }}
      animate={{ height: 'auto' }}
      className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]"
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Output</span>
          {executionTime > 0 && (
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {executionTime.toFixed(1)}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleVariables}
            className={`p-1 rounded-md transition-all duration-200 ${
              showVariables ? 'text-[var(--accent-blue)] bg-[var(--accent-blue)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Toggle Variables"
          >
            {showVariables ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex">
        {/* Output Console */}
        <div
          ref={outputRef}
          className={`${showVariables ? 'w-2/3' : 'w-full'} h-48 overflow-y-auto p-3 font-mono text-sm leading-relaxed`}
        >
          {output.length === 0 ? (
            <span className="text-[var(--text-muted)] italic">
              Run your program to see output here...
            </span>
          ) : (
            <AnimatePresence>
              {output.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`whitespace-pre-wrap ${
                    entry.type === 'error'
                      ? 'text-[var(--accent-red)]'
                      : entry.type === 'info'
                      ? 'text-[var(--accent-blue)] italic'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {entry.type === 'error' && <span className="mr-1">✕</span>}
                  {entry.type === 'info' && <span className="mr-1">→</span>}
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Variables Panel */}
        <AnimatePresence>
          {showVariables && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '33.333%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-[var(--border-color)] p-3 overflow-y-auto h-48"
            >
              <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Variables
              </div>
              {Object.keys(variables).length === 0 ? (
                <span className="text-xs text-[var(--text-muted)] italic">No variables</span>
              ) : (
                <div className="space-y-1">
                  {Object.entries(variables).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs py-0.5"
                    >
                      <span className="text-[var(--accent-cyan)] font-medium">{key}</span>
                      <span className="text-[var(--text-secondary)] ml-2 truncate">
                        {formatValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(v => formatValue(v)).join(', ')}]`
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}
