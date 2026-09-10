import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AddFish from './pages/AddFish'
import Home from './pages/Home'
import Stats from './pages/Stats'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import './App.css'

function App() {
    const [user, setUser] = useState(null)
    const [showRegister, setShowRegister] = useState(false)

    if (user === null) {
        if (showRegister) {
            return <Register onBackToLogin={() => setShowRegister(false)} />
        }

        return (
            <Login
                onLogin={setUser}
                onRegister={() => setShowRegister(true)}
            />
        )
    }

    return (
        <Swiper
            initialSlide={1}
            slidesPerView={1}
        >
            <SwiperSlide>
                <AddFish />
            </SwiperSlide>

            <SwiperSlide>
                <Home />
            </SwiperSlide>

            <SwiperSlide>
                <Stats />
            </SwiperSlide>
        </Swiper>
    )
}

export default App