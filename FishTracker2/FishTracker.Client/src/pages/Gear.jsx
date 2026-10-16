import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Gear.css'
import { API_BASE_URL } from '../config/api'

const emptyForm = {
    presetName: '',
    fishingRod: '',
    lure: ''
}

function Gear() {
    const { token } = useAuth()

    const [presets, setPresets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [busyId, setBusyId] = useState(null)

    useEffect(() => {
        if (!token) {
            setPresets([])
            setLoading(false)
            return
        }

        const controller = new AbortController()

        async function loadPresets() {
            setLoading(true)
            setError('')

            try {
                const response = await fetch(`${API_BASE_URL}/api/gear`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error('Unable to load gear presets.')
                }

                const data = await response.json()
                setPresets(data)
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadPresets()
        return () => controller.abort()
    }, [token])

    async function refreshPresets() {
        const response = await fetch(`${API_BASE_URL}/api/gear`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Unable to refresh gear presets.')
        }

        setPresets(await response.json())
    }

    function updateField(event) {
        const { name, value } = event.target

        setForm(previous => ({
            ...previous,
            [name]: value
        }))
    }

    async function handleCreate(event) {
        event.preventDefault()

        if (saving) return

        setSaving(true)
        setError('')
        setMessage('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/gear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    presetName: form.presetName.trim(),
                    fishingRod: form.fishingRod.trim(),
                    lure: form.lure.trim()
                })
            })

            if (!response.ok) {
                throw new Error('Unable to create gear preset.')
            }

            await refreshPresets()

            setForm({ ...emptyForm })
            setShowCreate(false)
            setMessage('Gear preset created successfully.')
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleEquip(gearId) {
        if (busyId !== null) return

        setBusyId(gearId)
        setError('')
        setMessage('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/gear/${gearId}/equip`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Unable to equip this preset.')
            }

            await refreshPresets()
            setMessage('Gear preset equipped.')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusyId(null)
        }
    }

    async function handleDelete(gearId) {
        if (busyId !== null) return

        const confirmed = window.confirm(
            'Are you sure you want to delete this gear preset?'
        )

        if (!confirmed) return

        setBusyId(gearId)
        setError('')
        setMessage('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/gear/${gearId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Unable to delete this preset.')
            }

            await refreshPresets()
            setMessage('Gear preset deleted.')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusyId(null)
        }
    }

    const equippedPreset = presets.find(preset => preset.isEquipped)

    return (
        <main className="gear-screen">
            <section className="gear-surface">
                <header className="gear-header">
                    <h1>Gear Presets</h1>
                    <p>Save your favorite fishing setups and switch between them.</p>
                </header>

                <div className="gear-current">
                    <div className="gear-current-heading">
                        <span>Currently Equipped</span>
                        <span className="gear-status-dot" />
                    </div>

                    {equippedPreset ? (
                        <>
                            <h2>{equippedPreset.presetName}</h2>
                            <p>Rod: {equippedPreset.fishingRod}</p>
                            <p>Lure: {equippedPreset.lure}</p>
                        </>
                    ) : (
                        <p>No gear preset equipped yet.</p>
                    )}
                </div>

                <button
                    type="button"
                    className="gear-create-button"
                    onClick={() => {
                        setError('')
                        setShowCreate(true)
                    }}
                >
                    + Create Gear Preset
                </button>
            </section>

            <section className="gear-deep">
                <div className="gear-list-heading">
                    <h2>Saved Presets</h2>
                    <span>{presets.length} total</span>
                </div>

                {error && <p className="gear-error" role="alert">{error}</p>}
                {message && <p className="gear-message" role="status">{message}</p>}

                {loading ? (
                    <p className="gear-empty">Loading your presets...</p>
                ) : presets.length === 0 ? (
                    <div className="gear-empty">
                        <span>🎣</span>
                        <h3>No presets yet</h3>
                        <p>Create your first fishing setup to get started.</p>
                    </div>
                ) : (
                    <div className="gear-list">
                        {presets.map(preset => (
                            <article
                                className={`gear-card ${preset.isEquipped ? 'gear-card-equipped' : ''}`}
                                key={preset.gearId}
                            >
                                <div className="gear-card-top">
                                    <h3>{preset.presetName}</h3>
                                    {preset.isEquipped && (
                                        <span className="gear-equipped-badge">
                                            Equipped
                                        </span>
                                    )}
                                </div>

                                <div className="gear-details">
                                    <p><strong>Fishing Rod</strong> {preset.fishingRod}</p>
                                    <p><strong>Lure</strong> {preset.lure}</p>
                                </div>

                                <div className="gear-actions">
                                    <button
                                        type="button"
                                        className="gear-equip-button"
                                        disabled={preset.isEquipped || busyId !== null}
                                        onClick={() => handleEquip(preset.gearId)}
                                    >
                                        {preset.isEquipped
                                            ? 'Currently Equipped'
                                            : busyId === preset.gearId
                                                ? 'Updating...'
                                                : 'Equip'}
                                    </button>

                                    <button
                                        type="button"
                                        className="gear-delete-button"
                                        disabled={busyId !== null}
                                        onClick={() => handleDelete(preset.gearId)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {showCreate && (
                <div
                    className="gear-modal-overlay"
                    onClick={() => {
                        if (!saving) setShowCreate(false)
                    }}
                >
                    <div
                        className="gear-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gear-modal-title"
                        onClick={event => event.stopPropagation()}
                        onTouchStart={event => event.stopPropagation()}
                        onTouchMove={event => event.stopPropagation()}
                        onTouchEnd={event => event.stopPropagation()}
                    >
                        <h2 id="gear-modal-title">Create Gear Preset</h2>
                        <p>Build a setup you can reuse on future fishing trips.</p>

                        <form onSubmit={handleCreate}>
                            <label htmlFor="gear-preset-name">Preset Name</label>
                            <input
                                id="gear-preset-name"
                                name="presetName"
                                value={form.presetName}
                                onChange={updateField}
                                placeholder="e.g. Bass Fishing Setup"
                                maxLength={100}
                                required
                            />

                            <label htmlFor="gear-fishing-rod">Fishing Rod</label>
                            <input
                                id="gear-fishing-rod"
                                name="fishingRod"
                                value={form.fishingRod}
                                onChange={updateField}
                                placeholder="e.g. Shimano Expride"
                                maxLength={150}
                                required
                            />

                            <label htmlFor="gear-lure">Lure</label>
                            <input
                                id="gear-lure"
                                name="lure"
                                value={form.lure}
                                onChange={updateField}
                                placeholder="e.g. Spinnerbait"
                                maxLength={150}
                                required
                            />

                            <div className="gear-modal-actions">
                                <button
                                    type="button"
                                    className="gear-cancel-button"
                                    disabled={saving}
                                    onClick={() => setShowCreate(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="gear-save-button"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Preset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Gear