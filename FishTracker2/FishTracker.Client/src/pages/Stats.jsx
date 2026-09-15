import './Stats.css'
import fishweight from '../assets/fishweight.png'
import fishRuler from '../assets/fishRuler.png'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Stats() {
const { token, statsRefresh } = useAuth()

const [statsData, setStatsData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
    if (!token) return

    setLoading(true)

    fetch('/api/users/me/stats', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load stats.')
            }

            return response.json()
        })
        .then(data => {
            setStatsData(data)
            setLoading(false)
        })
        .catch(error => {
            console.error(error)
            setLoading(false)
        })

}, [token, statsRefresh])

if (!token) {
    return <div>Please log in.</div>
}

if (loading || !statsData) {
    return <div>Loading...</div>
}

const maxPossibleLength = statsData.longestFish
const maxPossibleWeight = statsData.heaviestFish

const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max)

const RULER_START = 22
const RULER_END = 96

const WEIGHT_START = 22
const WEIGHT_END = 96

const mapToTrack = (value, max, start, end) => {
    if (!max || max <= 0) return start

    const ratio = clamp(value / max, 0, 1)

    return start + ratio * (end - start)
}

const lengthAvgPosition = mapToTrack(
    statsData.avgLength,
    maxPossibleLength,
    RULER_START,
    RULER_END
)

const lengthBestPosition = mapToTrack(
    statsData.longestFish,
    maxPossibleLength,
    RULER_START,
    RULER_END
)

const weightAvgPosition = mapToTrack(
    statsData.avgWeight,
    maxPossibleWeight,
    WEIGHT_START,
    WEIGHT_END
)

const weightBestPosition = mapToTrack(
    statsData.heaviestFish,
    maxPossibleWeight,
    WEIGHT_START,
    WEIGHT_END
)

return (
    <main className="stats-screen">
        <section className="surface-zone">
            <header className="stats-header">
                <h1>Angler Dashboard</h1>
            </header>

            <div className="activity-widgets">
                <div className="widget">
                    <div className="widget-icon">⏱️</div>
                    <span className="widget-value">{0}</span>
                    <span className="widget-label">Time Spent</span>
                </div>

                <div className="widget">
                    <div className="widget-icon">⛵</div>
                    <span className="widget-value">{0}</span>
                    <span className="widget-label">Trips</span>
                </div>

                <div className="widget">
                    <div className="widget-icon">🐟</div>
                    <span className="widget-value">{statsData.fishCaught}</span>
                    <span className="widget-label">Total Caught</span>
                </div>
            </div>
        </section>

        <section className="deep-zone">
            <h2 className="zone-title">Catch Analytics</h2>

            <div className="analytic-card">
                <div className="card-header">
                    <h3>Length Profile</h3>
                </div>

                <div className="tape-container">
                    <img src={fishRuler} alt="Tape Measure" className="ruler-img" />

                    <div
                        className="debug-marker start-debug"
                        style={{ left: `${RULER_START}%` }}
                    >
                        <span>START</span>
                    </div>

                    <div
                        className="debug-marker end-debug"
                        style={{ left: `${RULER_END}%` }}
                    >
                        <span>END</span>
                    </div>

                    <div
                        className="ruler-marker avg-marker-length"
                        style={{ left: `${lengthAvgPosition}%` }}
                    >
                        <span className="marker-text">
                            Avg ({Number(statsData.avgLength).toFixed(2)} in)
                        </span>
                        <span className="marker-line"></span>
                    </div>

                    <div
                        className="ruler-marker record-marker-length"
                        style={{ left: `${lengthBestPosition}%` }}
                    >
                        <span className="marker-text">
                            Record ({Number(statsData.longestFish).toFixed(2)} in)
                        </span>
                        <span className="marker-line record-line"></span>
                    </div>
                </div>
            </div>

            <div className="analytic-card">
                <div className="card-header">
                    <h3>Weight Profile</h3>
                </div>

                <div className="scale-container">
                    <img src={fishweight} alt="Weight Scale" className="scale-img" />

                    <div
                        className="debug-marker start-debug"
                        style={{ left: `${WEIGHT_START}%` }}
                    >
                        <span>START</span>
                    </div>

                    <div
                        className="debug-marker end-debug"
                        style={{ left: `${WEIGHT_END}%` }}
                    >
                        <span>END</span>
                    </div>

                    <div
                        className="scale-marker avg-marker-weight"
                        style={{ left: `${weightAvgPosition}%` }}
                    >
                        <span className="marker-text">
                            Avg ({Number(statsData.avgWeight).toFixed(2)} lbs)
                        </span>
                        <span className="marker-line"></span>
                    </div>

                    <div
                        className="scale-marker record-marker-weight"
                        style={{ left: `${weightBestPosition}%` }}
                    >
                        <span className="marker-text">
                            Record ({Number(statsData.heaviestFish).toFixed(2)} lbs)
                        </span>
                        <span className="marker-line record-line"></span>
                    </div>
                </div>
            </div>
        </section>
    </main>
)

}

export default Stats
