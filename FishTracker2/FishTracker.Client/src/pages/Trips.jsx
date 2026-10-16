
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Trips.css'
import { API_BASE_URL } from '../config/api'

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
    })
}

function formatDuration(minutes) {
    if (minutes == null) return 'In Progress'

    const seconds = Math.max(0, Math.round(minutes * 60))

    if (seconds < 60) return `${seconds}s`

    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`

    return `${hours}h ${mins}m`
}

function Trips() {
    const { token, statsRefresh } = useAuth()

    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) {
            setTrips([])
            setLoading(false)
            return
        }

        const controller = new AbortController()

        async function fetchTrips() {
            setLoading(true)
            setError('')

            try {
                const response = await fetch(`${API_BASE_URL}/api/trips`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error('Failed to load fishing trips.')
                }

                const data = await response.json()

                if (!controller.signal.aborted) {
                    setTrips(data)
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchTrips()

        return () => controller.abort()
    }, [token, statsRefresh])

    const completedTrips = trips.filter(
        trip => trip.endTime !== null
    )

    const totalMinutes = completedTrips.reduce(
        (sum, trip) => sum + (trip.durationMinutes ?? 0),
        0
    )

    return (
        <div className="trips-screen">

            {/* ABOVE WATER */}
            <div className="trips-surface">
                <header className="trips-header">
                    <h1>Fishing Trip History</h1>
                    <p>Your time spent out on the water</p>
                </header>

                <div className="trips-widgets">
                    <div className="trips-widget">
                        <span className="trips-widget-icon">🎣</span>
                        <span className="trips-widget-value">
                            {completedTrips.length}
                        </span>
                        <span className="trips-widget-label">
                            Total Trips
                        </span>
                    </div>

                    <div className="trips-widget">
                        <span className="trips-widget-icon">⏱️</span>
                        <span className="trips-widget-value">
                            {formatDuration(totalMinutes)}
                        </span>
                        <span className="trips-widget-label">
                            Time Fishing
                        </span>
                    </div>
                </div>
            </div>

            {/* UNDERWATER */}
            <div className="trips-deep-zone">
                <div className="trips-section-heading">
                    <h2>Recent Trips</h2>
                    <span className="trips-count">
                        {trips.length} Recorded
                    </span>
                </div>

                <div className="trips-scroll">

                    {loading && (
                        <p className="trips-message">
                            Loading your fishing trips...
                        </p>
                    )}

                    {!loading && error && (
                        <p className="trips-message trips-error">
                            {error}
                        </p>
                    )}

                    {!loading && !error && trips.length === 0 && (
                        <div className="trips-empty">
                            <span className="trips-empty-icon">🎣</span>
                            <h3>No Trips Yet</h3>
                            <p>
                                Start a fishing trip from the Home page
                                to begin recording your adventures.
                            </p>
                        </div>
                    )}

                    {!loading && !error && trips.map((trip) => {
                        const hasGear = Boolean(
                            trip.gearPresetName ||
                            trip.fishingRod ||
                            trip.lure
                        )

                        return (
                            <div
                                className="trips-card"
                                key={trip.fishingTripId}
                            >
                                <div className="trips-card-header">
                                    <div className="trips-card-title">
                                        <span className="trips-card-icon">
                                            🎣
                                        </span>
                                        <h3>
                                            {formatDate(trip.startTime)}
                                        </h3>
                                    </div>

                                    <span className={
                                        trip.endTime
                                            ? 'trips-status completed'
                                            : 'trips-status active'
                                    }>
                                        {trip.endTime
                                            ? 'Completed'
                                            : 'In Progress'}
                                    </span>
                                </div>

                                <div className="trips-card-divider" />

                                <div className="trips-card-details">
                                    <div className="trips-detail">
                                        <span className="trips-detail-label">
                                            Started
                                        </span>
                                        <strong>
                                            {formatTime(trip.startTime)}
                                        </strong>
                                    </div>

                                    <div className="trips-detail">
                                        <span className="trips-detail-label">
                                            Ended
                                        </span>
                                        <strong>
                                            {trip.endTime
                                                ? formatTime(trip.endTime)
                                                : '—'}
                                        </strong>
                                    </div>

                                    <div className="trips-detail">
                                        <span className="trips-detail-label">
                                            Duration
                                        </span>
                                        <strong className="trips-duration">
                                            {formatDuration(
                                                trip.durationMinutes
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                {/* GEAR SNAPSHOT */}
                                <div className="trips-card-divider" />

                                <div className="trips-gear-heading">
                                    <span className="trips-gear-icon">🎒</span>
                                    <h4>Gear Used</h4>
                                </div>

                                {hasGear ? (
                                    <div className="trips-gear-panel">
                                        <div className="trips-gear-row">
                                            <span>Preset</span>
                                            <strong>
                                                {trip.gearPresetName || '—'}
                                            </strong>
                                        </div>

                                        <div className="trips-gear-row">
                                            <span>Rod</span>
                                            <strong>
                                                {trip.fishingRod || '—'}
                                            </strong>
                                        </div>

                                        <div className="trips-gear-row">
                                            <span>Lure</span>
                                            <strong>
                                                {trip.lure || '—'}
                                            </strong>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="trips-no-gear">
                                        No gear recorded for this trip.
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Trips
