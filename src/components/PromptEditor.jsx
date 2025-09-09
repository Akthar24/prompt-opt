import React, { useState, useEffect } from 'react'
import ScoreChart from './ScoreChart'
import PromptCard from './PromptCard'
import { saveEntry, getTemplates, saveTemplate } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

const PromptEditor = ({ selectedEntry, onHistoryUpdate, onCompare }) => {
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [optimizedData, setOptimizedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState('')
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // 🔑 Hardcoded API Key (from your working HTML version)
  const apiKey = API_KEY;

  // Load templates and set initial prompt if entry is selected
  useEffect(() => {
    const savedTemplates = getTemplates()
    setTemplates(savedTemplates)
    
    if (selectedEntry) {
      setOriginalPrompt(selectedEntry.original)
      setOptimizedData({
        optimized: selectedEntry.optimized,
        score: selectedEntry.score,
        explanation: selectedEntry.explanation,
        related: selectedEntry.related
      })
      setTags(selectedEntry.tags || [])
    } else {
      setOriginalPrompt('')
      setOptimizedData(null)
      setTags([])
    }
  }, [selectedEntry])

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  // Remove a tag
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // Apply a template
  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setOriginalPrompt(template.content)
      setSelectedTemplate(templateId)
    }
  }

  // Save current prompt as a template
  const saveAsTemplate = () => {
    if (!originalPrompt.trim()) return
    
    const newTemplate = {
      id: uuidv4(),
      name: `Template ${templates.length + 1}`,
      content: originalPrompt,
      createdAt: new Date().toISOString()
    }
    
    saveTemplate(newTemplate)
    setTemplates([...templates, newTemplate])
    alert('Template saved!')
  }

  // Optimize the prompt - USING THE SAME STRUCTURE AS YOUR WORKING HTML VERSION
  const optimizePrompt = async () => {
    if (!originalPrompt.trim()) {
      setError('Please enter a prompt to optimize')
      return
    }

    setIsLoading(true)
    setError('')

    // Same system prompt as your HTML version
    const systemPrompt = `
    You are a Prompt Engineer. 
    Task: Take the user's input prompt and:
    1. Rewrite it as a clearer, more detailed optimized prompt.
    2. Assign a quality score (0-100).
    3. Explain briefly why the optimized prompt is better.
    4. Suggest 2-3 related prompts.
    Respond in JSON with keys: optimized, score, explanation, related.
    `

    try {
      // EXACT SAME API CALL STRUCTURE AS YOUR WORKING HTML VERSION
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`, // Using hardcoded key
          "HTTP-Referer": "http://localhost:5173", // Same as HTML but different port
          "X-Title": "Prompt Optimizer" // Same concept as HTML version
        },
        body: JSON.stringify({
          model: "gpt-oss-120b", // Same model as your working HTML version
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: originalPrompt }
          ]
          // Removed response_format to match your HTML version
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json();
      
      // Same response handling as your HTML version
      const content = data.choices[0].message.content;

      // Try parsing JSON (same as HTML version)
      let result;
      try {
        result = JSON.parse(content);
      } catch {
        result = { 
          optimized: content, 
          score: 70, // Same fallback score as HTML version
          explanation: "Auto-generated", // Same fallback text
          related: [] 
        };
      }

      setOptimizedData(result);

      // Save to history
      const newEntry = {
        id: selectedEntry?.id || uuidv4(),
        original: originalPrompt,
        optimized: result.optimized,
        score: result.score,
        explanation: result.explanation,
        related: result.related || [],
        tags: tags,
        templatesUsed: selectedTemplate ? [selectedTemplate] : [],
        versions: selectedEntry ? [
          ...(selectedEntry.versions || []),
          {
            id: uuidv4(),
            optimized: result.optimized,
            score: result.score,
            explanation: result.explanation,
            createdAt: new Date().toISOString()
          }
        ] : [],
        createdAt: selectedEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveEntry(newEntry);
      onHistoryUpdate();

    } catch (error) {
      setError(error.message);
      console.error('Optimization error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="prompt-editor">
      <div className="editor-header">
        <h2>{selectedEntry ? 'Edit Prompt' : 'Create New Prompt'}</h2>
        {optimizedData && (
          <div className="score-display">
            <ScoreChart score={optimizedData.score} />
          </div>
        )}
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="prompt-input">
            <i className="fas fa-keyboard"></i> Your Prompt:
          </label>
          <textarea
            id="prompt-input"
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            rows="5"
          />
        </div>

        <div className="editor-controls">
          <div className="tag-input">
            <label>
              <i className="fas fa-tags"></i> Tags:
            </label>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag(index)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Type and press Enter to add tags"
              />
            </div>
          </div>

          <div className="template-selector">
            <label>
              <i className="fas fa-layer-group"></i> Templates:
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
            >
              <option value="">Select a template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <button onClick={saveAsTemplate} className="secondary">
              <i className="fas fa-save"></i> Save as Template
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          onClick={optimizePrompt} 
          disabled={isLoading}
          className="primary-button"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Optimizing...
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i> Optimize Prompt
            </>
          )}
        </button>
      </div>

      {optimizedData && (
        <div className="results-section">
          <PromptCard 
            original={originalPrompt}
            optimized={optimizedData.optimized}
            explanation={optimizedData.explanation}
            related={optimizedData.related}
            score={optimizedData.score}
            tags={tags}
            onCompare={onCompare}
            entryId={selectedEntry?.id}
          />
        </div>
      )}
    </div>
  )
}

export default PromptEditor
