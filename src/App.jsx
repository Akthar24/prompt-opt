import React, { useState, useEffect } from 'react'
import PromptEditor from './components/PromptEditor'
import HistoryPanel from './components/HistoryPanel'
import CompareView from './components/CompareView'
import { getHistory } from './utils/storage'

function App() {
  const [history, setHistory] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [versionsToCompare, setVersionsToCompare] = useState([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)

  // Load history on component mount
  useEffect(() => {
    const savedHistory = getHistory()
    setHistory(savedHistory)
  }, [])

  // Update history when a new entry is added
  const handleHistoryUpdate = () => {
    const savedHistory = getHistory()
    setHistory(savedHistory)
  }

  // Handle entry selection from history
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
    setCompareMode(false)
  }

  // Handle compare action
  const handleCompare = (versions) => {
    setVersionsToCompare(versions)
    setCompareMode(true)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1><i className="fas fa-magic"></i> Prompt Optimizer</h1>
        <button 
          className="history-toggle"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <i className={`fas ${isHistoryOpen ? 'fa-times' : 'fa-history'}`}></i>
          {isHistoryOpen ? 'Close History' : 'Show History'}
        </button>
      </header>

      <div className="app-content">
        <main className="main-panel">
          {compareMode ? (
            <CompareView 
              versions={versionsToCompare} 
              onExit={() => setCompareMode(false)}
            />
          ) : (
            <PromptEditor 
              selectedEntry={selectedEntry}
              onHistoryUpdate={handleHistoryUpdate}
              onCompare={handleCompare}
            />
          )}
        </main>

        {isHistoryOpen && (
          <HistoryPanel 
            history={history}
            onSelectEntry={handleSelectEntry}
            onCompare={handleCompare}
            onHistoryUpdate={handleHistoryUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default App