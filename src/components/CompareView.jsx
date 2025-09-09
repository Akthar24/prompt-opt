import React, { useState } from 'react'
import ScoreChart from './ScoreChart'

const CompareView = ({ versions, onExit }) => {
  const [viewMode, setViewMode] = useState('sideBySide') // 'sideBySide' or 'diff'

  if (!versions || versions.length < 2) {
    return (
      <div className="compare-view">
        <div className="compare-header">
          <h2>Compare Versions</h2>
          <button onClick={onExit} className="secondary">
            <i className="fas fa-arrow-left"></i> Back to Editor
          </button>
        </div>
        <div className="error-message">Not enough versions to compare</div>
      </div>
    )
  }

  // Simple text diff implementation (highlights added/removed words)
  const renderDiff = (textA, textB) => {
    const wordsA = textA.split(/\s+/)
    const wordsB = textB.split(/\s+/)
    
    const result = []
    const maxLength = Math.max(wordsA.length, wordsB.length)
    
    for (let i = 0; i < maxLength; i++) {
      if (i >= wordsA.length) {
        // Word added in B
        result.push(<span key={i} className="diff-added">{wordsB[i]} </span>)
      } else if (i >= wordsB.length) {
        // Word removed from A
        result.push(<span key={i} className="diff-removed">{wordsA[i]} </span>)
      } else if (wordsA[i] !== wordsB[i]) {
        // Word changed
        result.push(
          <span key={i}>
            <span className="diff-removed">{wordsA[i]}</span>
            <span className="diff-added">{wordsB[i]} </span>
          </span>
        )
      } else {
        // Word unchanged
        result.push(<span key={i}>{wordsA[i]} </span>)
      }
    }
    
    return result
  }

  const versionA = versions[0]
  const versionB = versions[1]

  return (
    <div className="compare-view">
      <div className="compare-header">
        <h2>
          <i className="fas fa-code-compare"></i> Compare Versions
        </h2>
        <div className="compare-controls">
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className="view-mode-selector"
          >
            <option value="sideBySide">Side by Side</option>
            <option value="diff">Diff View</option>
          </select>
          <button onClick={onExit} className="secondary">
            <i className="fas fa-arrow-left"></i> Back to Editor
          </button>
        </div>
      </div>

      <div className="compare-content">
        {viewMode === 'sideBySide' ? (
          <div className="side-by-side">
            <div className="version-panel">
              <div className="version-header">
                <h3>Version A</h3>
                {versionA.score !== null && (
                  <div className="version-score">
                    <ScoreChart score={versionA.score} compact={true} />
                    <span>Score: {versionA.score}</span>
                  </div>
                )}
                <div className="version-date">
                  {new Date(versionA.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="version-content">
                <div className="prompt-text">{versionA.optimized}</div>
                {versionA.explanation && (
                  <div className="explanation-text">
                    <h4>Explanation:</h4>
                    <p>{versionA.explanation}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="version-panel">
              <div className="version-header">
                <h3>Version B</h3>
                {versionB.score !== null && (
                  <div className="version-score">
                    <ScoreChart score={versionB.score} compact={true} />
                    <span>Score: {versionB.score}</span>
                  </div>
                )}
                <div className="version-date">
                  {new Date(versionB.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="version-content">
                <div className="prompt-text">{versionB.optimized}</div>
                {versionB.explanation && (
                  <div className="explanation-text">
                    <h4>Explanation:</h4>
                    <p>{versionB.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="diff-view">
            <div className="diff-header">
              <h3>Changes from Version A to Version B</h3>
              <div className="diff-scores">
                {versionA.score !== null && (
                  <div className="score-display">
                    <span>Version A: {versionA.score}</span>
                    <ScoreChart score={versionA.score} compact={true} />
                  </div>
                )}
                {versionB.score !== null && (
                  <div className="score-display">
                    <span>Version B: {versionB.score}</span>
                    <ScoreChart score={versionB.score} compact={true} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="diff-content">
              <h4>Prompt Changes:</h4>
              <div className="diff-text">
                {renderDiff(versionA.optimized, versionB.optimized)}
              </div>
              
              <h4>Explanation Changes:</h4>
              <div className="diff-text">
                {renderDiff(versionA.explanation || '', versionB.explanation || '')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompareView