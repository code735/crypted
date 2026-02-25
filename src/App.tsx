import { useState } from 'react'
import './App.css'

type InputTab = 'image' | 'video' | 'text'

function App() {
  const [activeTab, setActiveTab] = useState<InputTab>('image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [textValue, setTextValue] = useState('')
  const [createdLink, setCreatedLink] = useState('')

  const tabs: Array<{ key: InputTab; label: string }> = [
    { key: 'image', label: 'Image' },
    { key: 'video', label: 'Video' },
    { key: 'text', label: 'Text' },
  ]

  const resetLink = () => {
    setCreatedLink('')
  }

  const generateId = () => {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID()
    }
    return Math.random().toString(36).slice(2, 10)
  }

  const canCreate =
    (activeTab === 'image' && Boolean(imageFile)) ||
    (activeTab === 'video' && Boolean(videoFile)) ||
    (activeTab === 'text' && textValue.trim().length > 0)

  const handleCreate = () => {
    if (!canCreate) return
    const id = generateId()
    setCreatedLink(`https://links.local/${activeTab}/${id}`)
  }

  return (
    <div className="app">
      <div className="panel">
        <header className="panel__header">
          <p className="eyebrow">Create link</p>
          <h1>Plain link builder</h1>
          <p className="subtitle">Select a type, add content, and generate a shareable link.</p>
        </header>

        <div className="tabs" role="tablist" aria-label="Input type">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="tab"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                resetLink()
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="input-area">
          {activeTab === 'image' && (
            <label className="field">
              <span className="field__label">Image file</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setImageFile(file)
                  resetLink()
                }}
              />
              <span className="field__hint">
                {imageFile ? `Selected: ${imageFile.name}` : 'Pick a JPG, PNG, or WEBP file.'}
              </span>
            </label>
          )}

          {activeTab === 'video' && (
            <label className="field">
              <span className="field__label">Video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setVideoFile(file)
                  resetLink()
                }}
              />
              <span className="field__hint">
                {videoFile ? `Selected: ${videoFile.name}` : 'Pick an MP4, MOV, or WEBM file.'}
              </span>
            </label>
          )}

          {activeTab === 'text' && (
            <label className="field">
              <span className="field__label">Text content</span>
              <textarea
                rows={4}
                placeholder="Type or paste your text here."
                value={textValue}
                onChange={(event) => {
                  setTextValue(event.target.value)
                  resetLink()
                }}
              />
              <span className="field__hint">
                {textValue.trim().length > 0
                  ? `${textValue.trim().length} characters ready to share.`
                  : 'Plain text only.'}
              </span>
            </label>
          )}
        </div>

        <div className="actions">
          <button
            type="button"
            className="primary"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create link
          </button>
          <span className="actions__note">Link appears below after creation.</span>
        </div>

        {createdLink && (
          <div className="result" aria-live="polite">
            <span className="result__label">Link created</span>
            <a href={createdLink} target="_blank" rel="noreferrer">
              {createdLink}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
