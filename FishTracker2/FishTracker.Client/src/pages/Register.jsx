import { useState } from 'react'
import './Register.css'

function Register({ onBackToLogin }) {

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [error, setError] = useState('')
    const [registering, setRegistering] = useState(false)


    const handleChange = (e) => {

        const { name, value } = e.target

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }


    const handleSubmit = async (e) => {

        e.preventDefault()

        setError('')


        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setError(
                'Passwords do not match.'
            )

            return
        }


        if (formData.password.length < 8) {

            setError(
                'Password must be at least 8 characters long.'
            )

            return
        }


        setRegistering(true)


        try {

            const response = await fetch(
                'http://localhost:5554/api/users',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    })
                }
            )


            if (!response.ok) {

                const errorData =
                    await response.json()


                console.log(
                    'Registration error:',
                    errorData
                )


                setError(
                    errorData.message ??
                    'Registration failed. Please check your information.'
                )

                return
            }


            const user =
                await response.json()


            console.log(
                'Registered user:',
                user
            )


            onBackToLogin()

        } catch (error) {

            console.error(error)


            setError(
                'Could not connect to the server.'
            )

        } finally {

            setRegistering(false)

        }
    }


    return (

        <main className="register-container">


            <header className="register-header">

                <h1>
                    Create Account
                </h1>

                <p>
                    Start tracking your catches with FishTracker
                </p>

            </header>


            <div className="register-body">


                <form
                    onSubmit={handleSubmit}
                    className="register-form"
                >


                    <div className="register-form-group">

                        <label htmlFor="register-username">
                            Username
                        </label>

                        <input
                            id="register-username"
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            minLength={3}
                            maxLength={100}
                            required
                        />

                    </div>


                    <div className="register-form-group">

                        <label htmlFor="register-email">
                            Email Address
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="register-form-group">

                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={128}
                            required
                        />

                        <span className="password-hint">
                            Must be at least 8 characters
                        </span>

                    </div>


                    <div className="register-form-group">

                        <label htmlFor="register-confirm-password">
                            Confirm Password
                        </label>

                        <input
                            id="register-confirm-password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Repeat your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={128}
                            required
                        />

                    </div>


                    {error && (

                        <p className="register-error">
                            {error}
                        </p>

                    )}


                    <button
                        type="submit"
                        className="register-button"
                        disabled={registering}
                    >

                        {registering
                            ? 'Creating Account...'
                            : 'Create Account'
                        }

                    </button>


                </form>


                <div className="login-section">


                    <div className="register-divider">

                        <span>
                            Already have an account?
                        </span>

                    </div>


                    <button
                        className="login-link-button"
                        type="button"
                        onClick={onBackToLogin}
                    >
                        Back to Login
                    </button>


                </div>


            </div>


        </main>

    )
}


export default Register