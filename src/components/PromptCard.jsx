import React, { useState } from 'react'
import ScoreChart from './ScoreChart'
import { getHistory, saveEntry } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

const PromptCard = ({ 
  original, 
  optimized, 
  explanation, 
  related, 
  score, 
  tags, 
  onCompare, 
  entryId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullOptimized, setShowFullOptimized] = useState(false)

  // Save as a new version
  const saveAsNewVersion = () => {
    if (!entryId) return
    
    const history = getHistory()
    const entryIndex = history.findIndex(entry => entry.id === entryId)
    
    if (entryIndex !== -1) {
      const entry = history[entryIndex]
      const newVersion = {
        id: uuidv4(),
        optimized,
        score,
        explanation,
        createdAt: new Date().toISOString()
      }
      
      const updatedEntry = {
        ...entry,
        optimized,
        score,
        explanation,
        related,
        versions: [...(entry.versions || []), newVersion],
        updatedAt: new Date().toISOString()
      }
      
      saveEntry(updatedEntry)
      alert('New version saved!')
    }
  }

  // Handle compare action
  const handleCompare = () => {
    if (!entryId) return
    
    const history = getHistory()
    const entry = history.find(e => e.id === entryId)
    
    if (entry && entry.versions && entry.versions.length > 0) {
      // Use the two most recent versions for comparison
      const versions = [
        entry.versions[entry.versions.length - 1],
        { optimized, score, explanation, createdAt: new Date().toISOString() }
      ]
      onCompare(versions)
    }
  }

  return (
    <div className="prompt-card">
      <div className="card-header">
        <h3>Optimization Results</h3>
        <div className="card-actions">
          {entryId && (
            <>
              <button onClick={saveAsNewVersion} className="secondary">
                <i className="fas fa-save"></i> Save as New Version
              </button>
              <button onClick={handleCompare} className="secondary">
                <i className="fas fa-code-compare"></i> Compare Versions
              </button>
            </>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="secondary">
            <i className={`fas fa-${isExpanded ? 'compress' : 'expand'}`}></i>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="result-section">
          <h4>
            <i className="fas fa-pen"></i> Original Prompt
          </h4>
          <div className="prompt-text original">
            {original}
          </div>
        </div>

        <div className="result-section">
          <div className="section-header">
            <h4>
              <i className="fas fa-star"></i> Optimized Prompt
            </h4>
            {score !== null && <ScoreChart score={score} compact={true} />}
          </div>
          <div className="prompt-text optimized">
            {showFullOptimized || optimized.length < 300 
              ? optimized 
              : `${optimized.substring(0, 300)}...`
            }
            {optimized.length > 300 && (
              <button 
                className="text-toggle"
                onClick={() => setShowFullOptimized(!showFullOptimized)}
              >
                {showFullOptimized ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="result-section">
              <h4>
                <i className="fas fa-lightbulb"></i> Explanation
              </h4>
              <div className="explanation-text">
                {explanation}
              </div>
            </div>

            {related && related.length > 0 && (
              <div className="result-section">
                <h4>
                  <i className="fas fa-link"></i> Related Prompts
                </h4>
                <ul className="related-list">
                  {related.map((prompt, index) => (
                    <li key={index}>{prompt}</li>
                  ))}
                </ul>
              </div>
            )}

            {tags && tags.length > 0 && (
              <div className="result-section">
                <h4>
                  <i className="fas fa-tags"></i> Tags
                </h4>
                <div className="tags-container">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PromptCard