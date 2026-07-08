import express from 'express'
import cors from 'cors'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')))
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', language: 'NovaLang' })
})

// API endpoint to run code
app.post('/api/run', async (req, res) => {
  try {
    const { code } = req.body
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Code is required' })
      return
    }

    // Dynamic import for ESM compatibility
    const { runNovaLang } = await import('../../src/engine/index.ts')
    const result = await runNovaLang(code)

    res.json(result)
  } catch (e) {
    res.status(500).json({
      output: [],
      errors: [{ message: 'Internal server error', line: 0, column: 0 }],
      executionTime: 0,
      variables: {},
    })
  }
})

// Get examples
app.get('/api/examples', async (_req, res) => {
  try {
    const { examples } = await import('../../src/data/examples.ts')
    res.json(examples)
  } catch (e) {
    res.status(500).json({ error: 'Failed to load examples' })
  }
})

app.listen(PORT, () => {
  console.log(`NovaLang API server running on http://localhost:${PORT}`)
})
