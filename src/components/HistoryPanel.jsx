import React, { useState, useMemo } from 'react'
import PromptCard from './PromptCard'
import { deleteEntry, searchHistory, exportJSON, importJSON } from '../utils/storage'

const HistoryPanel = ({ history, onSelectEntry, onCompare, onHistoryUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [expandedEntry, setExpandedEntry] = useState(null)

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history
    return searchHistory(searchQuery)
  }, [history, searchQuery])

  // Handle entry selection
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
    onSelectEntry(entry)
    setExpandedEntry(null)
  }

  // Toggle entry expansion
  const toggleExpandEntry = (entry, e) => {
    e.stopPropagation()
    setExpandedEntry(expandedEntry === entry.id ? null : entry.id)
  }

  // Handle entry deletion
  const handleDeleteEntry = (entryId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(entryId)
      onHistoryUpdate()
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null)
        onSelectEntry(null)
      }
    }
  }

  // Handle export
  const handleExport = () => {
    exportJSON()
  }

  // Handle import
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        importJSON(data)
        onHistoryUpdate()
        alert('History imported successfully!')
      } catch (error) {
        alert('Error importing history: Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset file input
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>
          <i className="fas fa-history"></i> History
        </h3>
        <div className="history-actions">
          <button onClick={handleExport} className="secondary small">
            <i className="fas fa-download"></i> Export
          </button>
          <label className="import-button secondary small">
            <i className="fas fa-upload"></i> Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="search-box">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'No matching prompts found' : 'No optimization history yet'}
          </div>
        ) : (
          filteredHistory.map(entry => (
            <div
              key={entry.id}
              className={`history-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
              onClick={() => handleSelectEntry(entry)}
            >
              <div className="history-item-header">
                <span className="history-item-preview">
                  {entry.original.substring(0, 60)}
                  {entry.original.length > 60 && '...'}
                </span>
                <button
                  className="expand-button"
                  onClick={(e) => toggleExpandEntry(entry, e)}
                >
                  <i className={`fas fa-chevron-${expandedEntry === entry.id ? 'up' : 'down'}`}></i>
                </button>
              </div>

              <div className="history-item-meta">
                <span className="score-badge">
                  {entry.score !== null ? `Score: ${entry.score}` : 'No score'}
                </span>
                <span className="date">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="history-item-tags">
                  {entry.tags.map((tag, index) => (
                    <span key={index} className="tag mini">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {expandedEntry === entry.id && (
                <div className="history-item-details">
                  <div className="optimized-preview">
                    <strong>Optimized:</strong> {entry.optimized.substring(0, 100)}
                    {entry.optimized.length > 100 && '...'}
                  </div>
                  
                  <div className="history-item-actions">
                    <button 
                      onClick={() => onCompare([entry])}
                      className="secondary small"
                    >
                      <i className="fas fa-code-compare"></i> Compare
                    </button>
                    <button 
                      onClick={(e) => handleDeleteEntry(entry.id, e)}
                      className="danger small"
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HistoryPanel