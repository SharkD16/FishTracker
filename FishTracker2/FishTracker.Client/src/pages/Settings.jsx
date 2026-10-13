import './Settings.css'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Settings() {
    const { user, token, setUser, logout } = useAuth()

    const [username, setUsername] = useState(user?.username ?? '')
    const [email, setEmail] = useState(user?.email ?? '')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleUsernameChange = async (e) => {
        e.preventDefault()

        setMessage('')
        setError('')

        try {
            const response = await fetch('/api/users/me/username', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username
                })
            })

            if (!response.ok) {
                setError('Could not update username.')
                return
            }

            const updatedUser = await response.json()

            setUser(updatedUser)
            setUsername(updatedUser.username)
            setMessage('Username updated successfully.')

        } catch (error) {
            console.error(error)
            setError('Could not connect to the server.')
        }
    }

    const handleEmailChange = async (e) => {
        e.preventDefault()

        setMessage('')
        setError('')

        try {
            const response = await fetch('/api/users/me/email', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: email
                })
            })

            if (!response.ok) {
                setError('Could not update email.')
                return
            }

            const updatedUser = await response.json()

            setUser(updatedUser)
            setEmail(updatedUser.email)
            setMessage('Email updated successfully.')

        } catch (error) {
            console.error(error)
            setError('Could not connect to the server.')
        }
    }

    const handleDeleteAccount = async () => {
        setError('')

        try {
            const response = await fetch('/api/users/me', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                setError('Could not delete account.')
                return
            }

            logout()

        } catch (error) {
            console.error(error)
            setError('Could not connect to the server.')
        }
    }

    return (
        <main className="settings-page">

            <header className="settings-header">
                <h1>Settings</h1>
            </header>

            <section className="settings-section">
                <h2>Account</h2>

                <form onSubmit={handleUsernameChange}>
                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        minLength={3}
                        maxLength={100}
                        required
                    />

                    <button type="submit">
                        Change Username
                    </button>
                </form>

                <form onSubmit={handleEmailChange}>
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={256}
                        required
                    />

                    <button type="submit">
                        Change Email
                    </button>
                </form>

                <button
                    type="button"
                    onClick={logout}
                >
                    Log Out
                </button>

                <button
                    type="button"
                    className="delete-account-button"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    Delete Account
                </button>
            </section>

            {message && (
                <p className="settings-message">{message}</p>
            )}

            {error && (
                <p className="settings-error">{error}</p>
            )}

            {showDeleteConfirm && (
                <div
                    className="delete-confirm"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="delete-confirm-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="delete-warning-icon">
                            !
                        </div>

                        <h2>Delete Account?</h2>

                        <p>
                            This will permanently delete your FishTracker
                            account and all of your data.
                        </p>

                        <p className="delete-warning-text">
                            This action cannot be undone.
                        </p>

                        <div className="delete-confirm-buttons">
                            <button
                                type="button"
                                className="cancel-delete-button"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={handleDeleteAccount}
                            >
                                Yes, Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    )
}

export default Settings