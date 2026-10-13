import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
const [user, setUser] = useState(null)
const [token, setToken] = useState(null)
const [statsRefresh, setStatsRefresh] = useState(0)

const refreshStats = () => {
    setStatsRefresh(prev => prev + 1)
}

const logout = () => {
    setUser(null)
    setToken(null)
}

return (
    <AuthContext.Provider
        value={{
            user,
            setUser,
            token,
            setToken,
            logout,
            statsRefresh,
            refreshStats
        }}
    >
        {children}
    </AuthContext.Provider>
)

}

export function useAuth() {
return useContext(AuthContext)
}
