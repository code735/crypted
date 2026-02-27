import { useState } from 'react'
import './App.css'

type InputTab = 'image' | 'video' | 'text'

type PasswordManager = {
  key: string
  label: string
  description: string
  url: string
}

type DashboardStat = {
  label: string
  value: string
  meta: string
}

type ChecklistItem = {
  label: string
  meta: string
  status: 'done' | 'pending'
}

type ActivityItem = {
  label: string
  meta: string
}

const passwordManagers: PasswordManager[] = [
  {
    key: '1password',
    label: '1Password',
    description: 'Teams, travel mode, CLI access.',
    url: 'https://1password.com',
  },
  {
    key: 'bitwarden',
    label: 'Bitwarden',
    description: 'Open source vaults for every device.',
    url: 'https://bitwarden.com',
  },
  {
    key: 'dashlane',
    label: 'Dashlane',
    description: 'Password health and secure sharing.',
    url: 'https://www.dashlane.com',
  },
  {
    key: 'keeper',
    label: 'Keeper',
    description: 'Zero-knowledge security for teams.',
    url: 'https://www.keepersecurity.com',
  },
  {
    key: 'proton',
    label: 'Proton Pass',
    description: 'Privacy-first vaults and aliases.',
    url: 'https://proton.me/pass',
  },
]

const passwordRoute = '/password-manager'

const dashboardStats: DashboardStat[] = [
  {
    label: 'Saved logins',
    value: '128',
    meta: '12 updated this week',
  },
  {
    label: 'Shared items',
    value: '24',
    meta: '3 pending approvals',
  },
  {
    label: 'Security score',
    value: '92%',
    meta: 'Up 4 points',
  },
]

const securityChecklist: ChecklistItem[] = [
  {
    label: 'Rotate admin passwords',
    meta: 'Last done 14 days ago',
    status: 'pending',
  },
  {
    label: 'Enable two-factor',
    meta: 'Applied to 18 of 20 accounts',
    status: 'pending',
  },
  {
    label: 'Lock idle sessions',
    meta: 'Auto-lock set to 10 minutes',
    status: 'done',
  },
]

const recentActivity: ActivityItem[] = [
  {
    label: 'Added GitHub credential',
    meta: '2 hours ago by Alicia',
  },
  {
    label: 'Shared payroll vault',
    meta: 'Yesterday with Finance',
  },
  {
    label: 'Resolved 3 weak passwords',
    meta: '2 days ago via health audit',
  },
]

const actionHighlights = [
  {
    label: 'Run health audit',
    meta: 'Checks weak and reused passwords',
  },
  {
    label: 'Sync vault',
    meta: 'Last sync 5 minutes ago',
  },
  {
    label: 'Export report',
    meta: 'Download the security summary',
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
  const [selectedManagerKey, setSelectedManagerKey] = useState(passwordManagers[0].key)
  const [entryName, setEntryName] = useState('')
  const [entryUsername, setEntryUsername] = useState('')
  const [passwordLength, setPasswordLength] = useState(18)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const tabs: Array<{ key: InputTab; label: string }> = [
    { key: 'image', label: 'Image' },
    { key: 'video', label: 'Video' },
    { key: 'text', label: 'Text' },
  ]

  const resetLink = () => {
    setCreatedLink('')
  }

  const selectedManager =
    passwordManagers.find((manager) => manager.key === selectedManagerKey) ?? passwordManagers[0]

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

  const handleGeneratePassword = () => {
    const length = Math.min(40, Math.max(12, Math.floor(passwordLength) || 18))
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
    const values = new Uint32Array(length)
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(values)
    } else {
      for (let i = 0; i < length; i += 1) {
        values[i] = Math.floor(Math.random() * chars.length)
      }
    }
    const next = Array.from(values, (value) => chars[value % chars.length]).join('')
    setGeneratedPassword(next)
    setCopyStatus('idle')
  }

  const handleCopyPassword = async () => {
    if (!generatedPassword) return
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('idle')
    }
  }

  if (isPasswordView) {
    return (
      <div className="app">
        <div className="panel">
          <header className="panel__header">
            <p className="eyebrow">Password manager</p>
            <h1>Vault dashboard</h1>
            <p className="subtitle">Track vault health, prep entries, and keep your access tidy.</p>
          </header>

          <div className="manager-grid" role="tablist" aria-label="Password manager">
            {passwordManagers.map((manager) => (
              <button
                key={manager.key}
                type="button"
                className="manager-tab"
                role="tab"
                aria-selected={selectedManagerKey === manager.key}
                onClick={() => {
                  setSelectedManagerKey(manager.key)
                  setCopyStatus('idle')
                }}
              >
                <span className="manager-tab__title">{manager.label}</span>
                <span className="manager-tab__meta">{manager.description}</span>
              </button>
            ))}
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card">
              <div className="dashboard-card__header">
                <p className="dashboard-card__title">Vault overview</p>
                <p className="dashboard-card__meta">Live snapshot for {selectedManager.label}.</p>
              </div>

              <div className="stat-grid">
                {dashboardStats.map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <p className="stat-card__value">{stat.value}</p>
                    <p className="stat-card__label">{stat.label}</p>
                    <p className="stat-card__meta">{stat.meta}</p>
                  </div>
                ))}
              </div>

              <div className="dashboard-section">
                <p className="dashboard-section__title">Security checklist</p>
                <div className="checklist">
                  {securityChecklist.map((item) => (
                    <div
                      className={`checklist-item checklist-item--${item.status}`}
                      key={item.label}
                    >
                      <span
                        className={`checklist-status checklist-status--${item.status}`}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="checklist-item__title">{item.label}</p>
                        <p className="checklist-item__meta">{item.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-section">
                <p className="dashboard-section__title">Recent activity</p>
                <div className="activity-list">
                  {recentActivity.map((item) => (
                    <div className="activity-item" key={item.label}>
                      <p className="activity-item__title">{item.label}</p>
                      <p className="activity-item__meta">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-section">
                <p className="dashboard-section__title">Quick actions</p>
                <div className="action-grid">
                  {actionHighlights.map((action) => (
                    <div className="action-tile" key={action.label}>
                      <p className="action-tile__title">{action.label}</p>
                      <p className="action-tile__meta">{action.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="pass-card">
              <div className="pass-card__header">
                <p className="pass-card__title">Vault entry details</p>
                <p className="pass-card__meta">
                  Organize the entry before you move it into {selectedManager.label}.
                </p>
              </div>

              <div className="pass-card__fields">
                <label className="field">
                  <span className="field__label">Entry name</span>
                  <input
                    type="text"
                    placeholder="e.g. Work email"
                    value={entryName}
                    onChange={(event) => setEntryName(event.target.value)}
                  />
                  <span className="field__hint">
                    {entryName.trim().length > 0
                      ? `Ready to file under “${entryName.trim()}”.`
                      : 'Use a clear name you can search later.'}
                  </span>
                </label>

                <label className="field">
                  <span className="field__label">Username or email</span>
                  <input
                    type="text"
                    placeholder="name@company.com"
                    value={entryUsername}
                    onChange={(event) => setEntryUsername(event.target.value)}
                  />
                  <span className="field__hint">
                    {entryUsername.trim().length > 0
                      ? 'Looks good. Keep it consistent with your login.'
                      : 'Optional, but useful for autofill.'}
                  </span>
                </label>

                <label className="field">
                  <span className="field__label">Password length</span>
                  <input
                    type="number"
                    min={12}
                    max={40}
                    value={passwordLength}
                    onChange={(event) => setPasswordLength(Number(event.target.value))}
                  />
                  <span className="field__hint">Recommended: 16+ characters.</span>
                </label>
              </div>

              <div className="pass-actions">
                <button type="button" className="primary" onClick={handleGeneratePassword}>
                  Generate password
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={handleCopyPassword}
                  disabled={!generatedPassword}
                >
                  {copyStatus === 'copied' ? 'Copied' : 'Copy'}
                </button>
                <span className="actions__note">
                  {generatedPassword
                    ? 'Paste it into your manager to finish the entry.'
                    : 'Generate a password to preview it.'}
                </span>
              </div>

              <div className="pass-output">
                <input
                  type="text"
                  readOnly
                  value={generatedPassword}
                  placeholder="Your generated password appears here"
                />
              </div>
            </div>
          </div>

          <div className="pass-footer">
            <a className="secondary" href={selectedManager.url} target="_blank" rel="noreferrer">
              Open {selectedManager.label}
            </a>
            <a className="pass-back" href="/">
              Back to link builder
            </a>
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
