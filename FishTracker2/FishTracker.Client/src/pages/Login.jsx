import './Login.css'

function Login(){
    return(
        <main className = 'login'>
            <h1>Login</h1>

            <p className='title'>Username</p>
            <input 
            type='text'
            placeholder='Username'
            />
            <p className='title'>Password</p>
            <input 
            type='password'
            placeholder='Password'
            />

            <button>Login</button>

            <p>
                Don't have an account? 
                <a href='#'>Sign up</a>
            </p>



        </main>
    );
}
export default Login