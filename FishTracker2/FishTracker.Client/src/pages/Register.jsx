import React, { useState } from 'react';
import './Register.css';

function Register({ onBackToLogin }) {
  // State to hold user input data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handler to update state when a user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Form submission handler
 const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!')
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
            const error = await response.json()
            console.log('Registration error:', error)
            alert(JSON.stringify(error))
            return
        }

        const user = await response.json()

        console.log('Registered user:', user)

        // Go back to Login
        onBackToLogin()

    } catch (error) {
        console.error(error)
        alert('Could not connect to the server.')
    }
}

  return (
    <main className="register-container">
      <h1>Create Account</h1>
      
      <form onSubmit={handleSubmit} className="register-form">
        <label className="title">Username</label>
        <input 
          type="text" 
          name="username"
          placeholder="Username" 
          value={formData.username}
          onChange={handleChange}
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
          required
        />

        <label className="title">Confirm Password</label>
        <input 
          type="password" 
          name="confirmPassword"
          placeholder="Repeat password" 
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <button type="submit">Sign Up</button>
      </form>
      
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
  );
}

export default Register;
