import { useState } from 'react'
import './App.css'

type InputTab = 'image' | 'video' | 'text'

type PasswordEntry = {
  key: string
  site: string
  username: string
  url: string
  updated: string
  strength: 'Strong' | 'Weak' | 'Reused'
  password: string
}

const passwordRoute = '/password-manager'

const passwordEntries: PasswordEntry[] = [
  {
    key: 'google',
    site: 'Google',
    username: 'alex@studio.com',
    url: 'https://accounts.google.com',
    updated: 'Today',
    strength: 'Strong',
    password: 'H4x!7kR9tT2p',
  },
  {
    key: 'slack',
    site: 'Slack',
    username: 'alex@studio.com',
    url: 'https://slack.com',
    updated: 'Yesterday',
    strength: 'Reused',
    password: 'S1ack!2024',
  },
  {
    key: 'figma',
    site: 'Figma',
    username: 'alex@studio.com',
    url: 'https://www.figma.com',
    updated: '2 days ago',
    strength: 'Strong',
    password: 'F1gma#Secure22',
  },
  {
    key: 'github',
    site: 'GitHub',
    username: 'alex-porter',
    url: 'https://github.com',
    updated: 'Last week',
    strength: 'Weak',
    password: 'Github2024',
  },
  {
    key: 'notion',
    site: 'Notion',
    username: 'alex@studio.com',
    url: 'https://www.notion.so',
    updated: 'Last week',
    strength: 'Strong',
    password: 'N0tion!Pass42',
  },
  {
    key: 'aws',
    site: 'AWS',
    username: 'ops@studio.com',
    url: 'https://console.aws.amazon.com',
    updated: '2 weeks ago',
    strength: 'Reused',
    password: 'Cl0udOps#12',
  },
]

function App() {
  const currentUrl = new URL(window.location.href)
  const sharedText = currentUrl.searchParams.get('m') ?? ''
  const isTextView = currentUrl.pathname.startsWith('/text') && sharedText.length > 0
  const isPasswordView =
    currentUrl.pathname.startsWith(passwordRoute) || currentUrl.pathname.startsWith('/pass')

  const [activeTab, setActiveTab] = useState<InputTab>('image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [textValue, setTextValue] = useState('')
  const [createdLink, setCreatedLink] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntryKey, setSelectedEntryKey] = useState(passwordEntries[0].key)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const tabs: Array<{ key: InputTab; label: string }> = [
    { key: 'image', label: 'Image' },
    { key: 'video', label: 'Video' },
    { key: 'text', label: 'Text' },
  ]

  const resetLink = () => {
    setCreatedLink('')
  }

  const filteredEntries = passwordEntries.filter((entry) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return `${entry.site} ${entry.username}`.toLowerCase().includes(query)
  })

  const selectedEntry =
    filteredEntries.find((entry) => entry.key === selectedEntryKey) ?? filteredEntries[0] ?? null

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
    const origin = window.location.origin
    if (activeTab === 'text') {
      const encoded = encodeURIComponent(textValue.trim())
      setCreatedLink(`${origin}/text?m=${encoded}`)
      return
    }
    setCreatedLink(`${origin}/${activeTab}/${id}`)
  }

  const handleOpenLink = () => {
    const next = linkInput.trim()
    if (!next) return
    window.location.assign(next)
  }

  const handleCopyPassword = async () => {
    if (!selectedEntry) return
    try {
      await navigator.clipboard.writeText(selectedEntry.password)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('idle')
    }
  }

  if (isPasswordView) {
    const issueCount = passwordEntries.filter((entry) => entry.strength !== 'Strong').length
    const reusedCount = passwordEntries.filter((entry) => entry.strength === 'Reused').length
    return (
      <div className="app">
        <div className="panel panel--wide">
          <div className="pass-shell">
            <header className="pass-header">
              <div>
                <p className="eyebrow">Password manager</p>
                <h1>Passwords</h1>
                <p className="subtitle">Saved logins and passkeys, in one place.</p>
              </div>
              <div className="pass-header__actions">
                <button type="button" className="secondary">
                  Password checkup
                </button>
                <button type="button" className="primary">
                  Add
                </button>
              </div>
            </header>

            <div className="pass-search">
              <input
                type="text"
                placeholder="Search passwords"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="pass-layout">
              <aside className="pass-list">
                <div className="pass-summary">
                  <div className="pass-summary__item">
                    <p className="pass-summary__value">{passwordEntries.length}</p>
                    <p className="pass-summary__label">Passwords</p>
                  </div>
                  <div className="pass-summary__item">
                    <p className="pass-summary__value">{issueCount}</p>
                    <p className="pass-summary__label">Issues</p>
                  </div>
                  <div className="pass-summary__item">
                    <p className="pass-summary__value">{reusedCount}</p>
                    <p className="pass-summary__label">Reused</p>
                  </div>
                </div>

                <div className="pass-list-items">
                  {filteredEntries.length === 0 ? (
                    <p className="pass-empty">No matches found.</p>
                  ) : (
                    filteredEntries.map((entry) => (
                      <button
                        key={entry.key}
                        type="button"
                        className={`pass-entry${selectedEntry?.key === entry.key ? ' pass-entry--active' : ''}`}
                        onClick={() => {
                          setSelectedEntryKey(entry.key)
                          setCopyStatus('idle')
                        }}
                      >
                        <div className="pass-entry__title-row">
                          <span className="pass-entry__title">{entry.site}</span>
                          <span
                            className={`pass-entry__badge pass-entry__badge--${entry.strength.toLowerCase()}`}
                          >
                            {entry.strength}
                          </span>
                        </div>
                        <span className="pass-entry__meta">{entry.username}</span>
                        <span className="pass-entry__meta">Updated {entry.updated}</span>
                      </button>
                    ))
                  )}
                </div>
              </aside>

              <section className="pass-detail">
                {selectedEntry ? (
                  <>
                    <div className="pass-detail__header">
                      <div>
                        <p className="pass-detail__title">{selectedEntry.site}</p>
                        <p className="pass-detail__meta">{selectedEntry.username}</p>
                      </div>
                      <span
                        className={`pass-strength pass-strength--${selectedEntry.strength.toLowerCase()}`}
                      >
                        {selectedEntry.strength}
                      </span>
                    </div>

                    <div className="pass-detail__fields">
                      <div className="pass-field">
                        <span className="pass-field__label">Website</span>
                        <a
                          className="pass-field__value"
                          href={selectedEntry.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {selectedEntry.url}
                        </a>
                      </div>
                      <div className="pass-field">
                        <span className="pass-field__label">Username</span>
                        <span className="pass-field__value">{selectedEntry.username}</span>
                      </div>
                      <div className="pass-field">
                        <span className="pass-field__label">Password</span>
                        <span className="pass-field__value">••••••••••••</span>
                      </div>
                      <div className="pass-field">
                        <span className="pass-field__label">Last updated</span>
                        <span className="pass-field__value">{selectedEntry.updated}</span>
                      </div>
                    </div>

                    <div className="pass-detail__actions">
                      <button type="button" className="primary" onClick={handleCopyPassword}>
                        {copyStatus === 'copied' ? 'Copied' : 'Copy password'}
                      </button>
                      <a
                        className="secondary"
                        href={selectedEntry.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open site
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="pass-empty-detail">
                    <p>Select a password to see details.</p>
                  </div>
                )}
              </section>
            </div>

            <div className="pass-footer">
              <a className="pass-back" href="/">
                Back to link builder
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isTextView) {
    return (
      <div className="viewer">
        <div className="viewer__card">
          <p className="viewer__label">Shared text</p>
          <p className="viewer__text">{sharedText}</p>
          <a className="viewer__back" href="/">
            Create another link
          </a>
        </div>
      </div>
    )
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

        <div className="link-open">
          <label className="field">
            <span className="field__label">Open existing link</span>
            <div className="link-open__row">
              <input
                type="text"
                placeholder="Paste a link to open it"
                value={linkInput}
                onChange={(event) => setLinkInput(event.target.value)}
              />
              <button
                type="button"
                className="secondary"
                onClick={handleOpenLink}
                disabled={!linkInput.trim()}
              >
                Open
              </button>
            </div>
            <span className="field__hint">Opens the link in the same tab.</span>
          </label>
        </div>

        {createdLink && (
          <div className="result" aria-live="polite">
            <span className="result__label">Link created</span>
            <a href={createdLink} target="_blank" rel="noreferrer">
              {createdLink}
            </a>
          </div>
        )}

        <div className="panel-footer">
          <p className="panel-footer__label">Need to prep a vault entry?</p>
          <a className="secondary" href={passwordRoute}>
            Open password manager dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
