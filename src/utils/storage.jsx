// LocalStorage utility functions

// History management
export const getHistory = () => {
  try {
    const history = localStorage.getItem('promptOptimizerHistory')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error reading history from localStorage:', error)
    return []
  }
}

export const saveEntry = (entry) => {
  try {
    const history = getHistory()
    
    // Check if entry already exists (update instead of add)
    const existingIndex = history.findIndex(item => item.id === entry.id)
    
    if (existingIndex !== -1) {
      history[existingIndex] = entry
    } else {
      // Add new entry (limit history to 1000 entries)
      history.unshift(entry)
      if (history.length > 1000) {
        history.pop() // Remove oldest entry
      }
    }
    
    localStorage.setItem('promptOptimizerHistory', JSON.stringify(history))
    return true
  } catch (error) {
    console.error('Error saving entry to localStorage:', error)
    return false
  }
}

export const deleteEntry = (id) => {
  try {
    const history = getHistory()
    const updatedHistory = history.filter(entry => entry.id !== id)
    localStorage.setItem('promptOptimizerHistory', JSON.stringify(updatedHistory))
    return true
  } catch (error) {
    console.error('Error deleting entry from localStorage:', error)
    return false
  }
}

export const searchHistory = (query) => {
  const history = getHistory()
  if (!query.trim()) return history

  const searchTerm = query.toLowerCase()
  return history.filter(entry => 
    entry.original.toLowerCase().includes(searchTerm) ||
    entry.optimized.toLowerCase().includes(searchTerm) ||
    (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
    (entry.related && entry.related.some(prompt => prompt.toLowerCase().includes(searchTerm)))
  )
}

// Templates management
export const getTemplates = () => {
  try {
    const templates = localStorage.getItem('promptOptimizerTemplates')
    return templates ? JSON.parse(templates) : [
      {
        id: 'default-blog',
        name: 'Blog Post (1000 words)',
        content: 'Write a comprehensive blog post of approximately 1000 words about [topic]. The post should be engaging, well-researched, and include practical examples. Structure it with an introduction, several subheadings, and a conclusion.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-email',
        name: 'Email Draft',
        content: 'Compose a professional email to [recipient] about [subject]. The tone should be [friendly/formal/urgent] and include the following key points: [list points].',
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-code',
        name: 'Code Review',
        content: 'Review the following code for best practices, potential bugs, and optimization opportunities. Provide specific suggestions for improvement:\n\n[code snippet]',
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-analysis',
        name: 'Data Analysis',
        content: 'Analyze the following dataset and provide insights about [specific aspects]. Identify trends, outliers, and potential correlations. Present your findings in a clear, structured manner.',
        createdAt: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('Error reading templates from localStorage:', error)
    return []
  }
}

export const saveTemplate = (template) => {
  try {
    const templates = getTemplates()
    
    // Check if template already exists (update instead of add)
    const existingIndex = templates.findIndex(item => item.id === template.id)
    
    if (existingIndex !== -1) {
      templates[existingIndex] = template
    } else {
      templates.push(template)
    }
    
    localStorage.setItem('promptOptimizerTemplates', JSON.stringify(templates))
    return true
  } catch (error) {
    console.error('Error saving template to localStorage:', error)
    return false
  }
}

export const deleteTemplate = (id) => {
  try {
    const templates = getTemplates()
    const updatedTemplates = templates.filter(template => template.id !== id)
    localStorage.setItem('promptOptimizerTemplates', JSON.stringify(updatedTemplates))
    return true
  } catch (error) {
    console.error('Error deleting template from localStorage:', error)
    return false
  }
}

// Import/Export functions
export const exportJSON = () => {
  try {
    const history = getHistory()
    const dataStr = JSON.stringify(history, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `prompt-optimizer-history-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    return true
  } catch (error) {
    console.error('Error exporting history:', error)
    return false
  }
}

export const importJSON = (data) => {
  try {
    if (!Array.isArray(data)) {
      throw new Error('Imported data must be an array')
    }
    
    // Validate each entry has required fields
    const validEntries = data.filter(entry => 
      entry.id && entry.original && entry.optimized && entry.createdAt
    )
    
    if (validEntries.length === 0) {
      throw new Error('No valid entries found in imported data')
    }
    
    const currentHistory = getHistory()
    const mergedHistory = [...validEntries, ...currentHistory]
    
    // Limit to 1000 entries, keeping the newest ones
    const limitedHistory = mergedHistory.slice(0, 1000)
    
    localStorage.setItem('promptOptimizerHistory', JSON.stringify(limitedHistory))
    return true
  } catch (error) {
    console.error('Error importing history:', error)
    return false
  }
}