import React, { useState } from 'react';
import './Register.css';

function Register({ navigation }) {
  // State to hold user input data
  const [formData, setFormData] = useState({
    fullName: '',
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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic verification checks
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    console.log('Registration Submitted:', formData);
    // Add your signup logic or backend API calls here
  };

  return (
    <main className="register-container">
      <h1>Create Account</h1>
      
      <form onSubmit={handleSubmit} className="register-form">
        <label className="title">Full Name</label>
        <input 
          type="text" 
          name="fullName"
          placeholder="John Doe" 
          value={formData.fullName}
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
        {/* Toggle between React Router or React Navigation depending on your framework */}
        <button 
          className="link-btn" 
          onClick={() => navigation ? navigation.navigate('Login') : console.log('Link clicked')}
        >
          Log in
        </button>
      </p>
    </main>
  );
}

export default Register;
