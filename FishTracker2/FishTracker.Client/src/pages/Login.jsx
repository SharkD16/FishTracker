import './Login.css'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Login({ onRegister }) {
const { setUser, setToken } = useAuth()

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')

const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
        const response = await fetch('http://localhost:5554/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        if (!response.ok) {
            setError('Invalid email or password.')
            return
        }

        const loginData = await response.json()
        const accessToken = loginData.accessToken

        setToken(accessToken)

        const userResponse = await fetch(
            'http://localhost:5554/api/users/me',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        if (!userResponse.ok) {
            setError('Could not load user information.')
            setToken(null)
            return
        }

        const user = await userResponse.json()

        console.log('Logged in user:', user)

        setUser(user)

    } catch (error) {
        console.error(error)
        setError('Could not connect to the server.')
    }
}

return (
    <main className="login">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
            <p className="title">Email</p>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button
                type="button"
                className="signup-btn"
                onClick={onRegister}
            >
                Sign up
            </button>
        </div>
    </main>
)

}

export default Login
