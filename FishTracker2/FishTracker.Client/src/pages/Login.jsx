import './Login.css'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Login({ onRegister }) {

    const { setUser, setToken } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loggingIn, setLoggingIn] = useState(false)


    const handleLogin = async (e) => {

        e.preventDefault()

        setError('')
        setLoggingIn(true)


        try {

            const response = await fetch(
                'http://localhost:5554/api/auth/login',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            )


            if (!response.ok) {

                setError(
                    'Invalid email or password.'
                )

                return
            }


            const loginData =
                await response.json()

            const accessToken =
                loginData.accessToken


            setToken(accessToken)


            const userResponse = await fetch(
                'http://localhost:5554/api/users/me',
                {
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            )


            if (!userResponse.ok) {

                setError(
                    'Could not load user information.'
                )

                setToken(null)

                return
            }


            const user =
                await userResponse.json()


            console.log(
                'Logged in user:',
                user
            )


            setUser(user)

        } catch (error) {

            console.error(error)

            setError(
                'Could not connect to the server.'
            )

        } finally {

            setLoggingIn(false)

        }
    }


    return (

        <main className="login">


            <header className="login-header">

                <h1>
                    Welcome Back
                </h1>

                <p>
                    Log in to continue to FishTracker
                </p>

            </header>


            <div className="login-body">


                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >


                    <div className="login-form-group">

                        <label htmlFor="login-email">
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={
                                (e) =>
                                    setEmail(e.target.value)
                            }
                            required
                        />

                    </div>


                    <div className="login-form-group">

                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={
                                (e) =>
                                    setPassword(e.target.value)
                            }
                            required
                        />

                    </div>


                    {error && (

                        <p className="login-error">
                            {error}
                        </p>

                    )}


                    <button
                        type="submit"
                        className="login-button"
                        disabled={loggingIn}
                    >

                        {loggingIn
                            ? 'Logging In...'
                            : 'Login'
                        }

                    </button>


                </form>


                <div className="signup-section">

                    <div className="login-divider">

                        <span>
                            New to FishTracker?
                        </span>

                    </div>


                    <button
                        type="button"
                        className="signup-btn"
                        onClick={onRegister}
                    >
                        Create Account
                    </button>

                </div>


            </div>


        </main>

    )
}


export default Login