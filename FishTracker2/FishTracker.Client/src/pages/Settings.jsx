import './Settings.css'
import { useAuth } from '../context/AuthContext'

function Settings() {
    const { user, token, setUser, logout } = useAuth()

    return (
        <main className="settings-page">
            <h1>Settings</h1>
        </main>
    )
}

export default Settings