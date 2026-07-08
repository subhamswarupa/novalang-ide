import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface DocsPanelProps {
  onClose: () => void
}

export function DocsPanel({ onClose }: DocsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 text-sm overflow-y-auto h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Documentation</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 text-[var(--text-secondary)]">
        <Section title="Variables">
          <Code>LET name = "Nova"</Code>
          <Code>LET age = 25</Code>
          <Code>LET isReady = true</Code>
          <p>Declare variables with LET. Supports numbers, strings, booleans, and arrays.</p>
        </Section>

        <Section title="Print">
          <Code>PRINT "Hello"</Code>
          <Code>PRINT age + 5</Code>
          <p>Output values and expressions to the console.</p>
        </Section>

        <Section title="Input">
          <Code>INPUT name</Code>
          <p>Read user input into a variable.</p>
        </Section>

        <Section title="If / Else">
          <Code>{'IF age >= 18'}</Code>
          <Code>  PRINT "Adult"</Code>
          <Code>ELSE</Code>
          <Code>  PRINT "Minor"</Code>
          <Code>END</Code>
          <p>Conditional execution. End with END.</p>
        </Section>

        <Section title="While Loop">
          <Code>LET i = 1</Code>
          <Code>{'WHILE i <= 10'}</Code>
          <Code>  PRINT i</Code>
          <Code>  i = i + 1</Code>
          <Code>END</Code>
        </Section>

        <Section title="For Loop">
          <Code>FOR i = 1 TO 10</Code>
          <Code>  PRINT i</Code>
          <Code>END</Code>
          <p>Loop with a counter variable.</p>
        </Section>

        <Section title="Functions">
          <Code>FUNC greet(name)</Code>
          <Code>  PRINT "Hello"</Code>
          <Code>  PRINT name</Code>
          <Code>END</Code>
          <Code>greet("Nova")</Code>
        </Section>

        <Section title="Arrays">
          <Code>LET nums = [1, 2, 3]</Code>
          <Code>PRINT nums</Code>
        </Section>

        <Section title="Operators">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>Arithmetic:</span><span>+, -, *, /, %</span>
            <span>Comparison:</span><span>==, !=, &lt;, &gt;, &lt;=, &gt;=</span>
            <span>Logical:</span><span>AND, OR, NOT</span>
          </div>
        </Section>

        <Section title="Comments">
          <Code># This is a comment</Code>
        </Section>

        <Section title="Keyboard Shortcuts">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>Run:</span><span>Ctrl + Enter</span>
          </div>
        </Section>
      </div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1 text-xs leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] px-2 py-0.5 rounded text-xs font-mono">
      {children}
    </pre>
  )
}
