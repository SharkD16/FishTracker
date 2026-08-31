import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [statsRefresh, setStatsRefresh] = useState(0);

    const refreshStats = () => {
        setStatsRefresh(prev => prev + 1);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                statsRefresh,
                refreshStats
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}