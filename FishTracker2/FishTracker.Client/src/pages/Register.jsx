import React, { useState } from 'react'
import './Register.css'

function Register({ onBackToLogin }) {
const [formData, setFormData] = useState({
username: '',
email: '',
password: '',
confirmPassword: ''
})

const [error, setError] = useState('')

const handleChange = (e) => {
const { name, value } = e.target

setFormData((prevData) => ({
  ...prevData,
  [name]: value
}))

}

const handleSubmit = async (e) => {
e.preventDefault()
setError('')

if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match.')
  return
}

if (formData.password.length < 12) {
  setError('Password must be at least 12 characters long.')
  return
}

try {
  const response = await fetch('http://localhost:5554/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: formData.username,
      email: formData.email,
      password: formData.password
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.log('Registration error:', errorData)

    setError(
      errorData.message ??
      'Registration failed. Please check your information.'
    )

    return
  }

  const user = await response.json()

  console.log('Registered user:', user)

  onBackToLogin()

} catch (error) {
  console.error(error)
  setError('Could not connect to the server.')
}

}

return ( <main className="register-container"> <h1>Create Account</h1>

  <form onSubmit={handleSubmit} className="register-form">
    <label className="title">Username</label>
    <input
      type="text"
      name="username"
      placeholder="Username"
      value={formData.username}
      onChange={handleChange}
      minLength={3}
      maxLength={100}
      required
    />

    <label className="title">Email Address</label>
    <input
      type="email"
      name="email"
      placeholder="example@mail.com"
      value={formData.email}
      onChange={handleChange}
      required
    />

    <label className="title">Password</label>
    <input
      type="password"
      name="password"
      placeholder="Create password"
      value={formData.password}
      onChange={handleChange}
      minLength={12}
      maxLength={128}
      required
    />

    <label className="title">Confirm Password</label>
    <input
      type="password"
      name="confirmPassword"
      placeholder="Repeat password"
      value={formData.confirmPassword}
      onChange={handleChange}
      minLength={12}
      maxLength={128}
      required
    />

    <button type="submit">Sign Up</button>
  </form>

  {error && <p>{error}</p>}

  <p className="footer-text">
    Already have an account?
    <button
      className="link-btn"
      type="button"
      onClick={onBackToLogin}
    >
      Log in
    </button>
  </p>
</main>

)
}

export default Register
