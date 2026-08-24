import './Login.css'
import { useState } from 'react'

function Login({ onLogin, onRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()

        setError('')

        try {
            const response = await fetch('http://localhost:5554/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })

            if (!response.ok) {
                setError('Invalid username or password.')
                return
            }

            const user = await response.json()

            console.log('Logged in user:', user)

            onLogin(user)

        } catch (error) {
            console.error(error)
            setError('Could not connect to the server.')
        }
    }

    return (
        <main className="login">
            <h1>Login</h1>

            <form onSubmit={handleLogin}>

                <p className="title">Username</p>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <p className="title">Password</p>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

            </form>

            {error && <p>{error}</p>}

            <div className="signup-section">
                <p>Don't have an account?</p>

                <button type="button" className="signup-btn" onClick={onRegister}>
                    Sign up
                </button>
            </div>
        </main>
    )
}

export default Login