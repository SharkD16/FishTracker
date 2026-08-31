import './Stats.css'
import fishweight from '../assets/fishweight.png';
import fishRuler from '../assets/fishRuler.png';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
//started here
function Stats() {
    const { user , statsRefresh} = useAuth();
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!user) return;

        fetch(`/api/users/${user.userId}/stats`)
            .then(response => response.json())
            .then(data => {
                setStatsData(data);
                setLoading(false);
            });
    }, [user, statsRefresh]);

    if (!user) {
        return <div>Please log in.</div>
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    // Calculate percentages for custom progress visuals
    const maxPossibleLength = statsData.longestFish;
    const maxPossibleWeight = statsData.heaviestFish;

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    // These represent the ACTUAL ruler area inside each image.
    // Tweak these slightly if necessary.
    const RULER_START = 22;
    const RULER_END = 96;

    const WEIGHT_START = 22;
    const WEIGHT_END = 96;

    const mapToTrack = (value, max, start, end) => {
        if (!max || max <= 0) return start;

        const ratio = clamp(value / max, 0, 1);

        return start + ratio * (end - start);
    };

    const lengthAvgPosition = mapToTrack(
        statsData.avgLength,
        maxPossibleLength,
        RULER_START,
        RULER_END
    );

    const lengthBestPosition = mapToTrack(
        statsData.longestFish,
        maxPossibleLength,
        RULER_START,
        RULER_END
    );

    const weightAvgPosition = mapToTrack(
        statsData.avgWeight,
        maxPossibleWeight,
        WEIGHT_START,
        WEIGHT_END
    );

    const weightBestPosition = mapToTrack(
        statsData.heaviestFish,
        maxPossibleWeight,
        WEIGHT_START,
        WEIGHT_END
    );

    return (
        <main className="stats-screen">
            {/* ABOVE WATER: Activity Metrics */}
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

            {/* UNDERWATER: Analytical Records */}
            <section className="deep-zone">
                <h2 className="zone-title">Catch Analytics</h2>

                {/* Length Gauge (Tape Measure Concept) */}
                <div className="analytic-card">
                    <div className="card-header">
                        <h3>Length Profile</h3>
                    </div>

                    <div className="tape-container">
                        {/* The clean scale graphic */}
                        <img src={fishRuler} alt="Tape Measure" className="ruler-img" />

                        {/* Temporary ruler start marker */}
                        <div 
                            className="debug-marker start-debug" 
                            style={{ left: `${RULER_START}%` }}
                        >
                        <span>START</span>
                        </div>

                        {/* Temporary ruler end marker */}
                        <div
                            className="debug-marker end-debug"
                            style={{ left: `${RULER_END}%` }}
                        >
                            <span>END</span>
                        </div>


                        {/* Average Marker */}
                        <div className="ruler-marker avg-marker-length" style={{ left: `${lengthAvgPosition}%` }}>
                            <span className="marker-text">Avg ({statsData.avgLength} in)</span>
                            <span className="marker-line"></span>
                        </div>

                        {/* Record Marker */}
                        <div className="ruler-marker record-marker-length" style={{ left: `${lengthBestPosition}%` }}>
                            <span className="marker-text">Record ({statsData.longestFish} in)</span>
                            <span className="marker-line record-line"></span>
                        </div>
                    </div>
                </div>

                {/* Weight Gauge (Mechanical Scale Concept) */}

                <div className="analytic-card">
                    <div className="card-header">
                        <h3>Weight Profile</h3>
                    </div>

                    <div className="scale-container">
                        {/* The clean scale graphic */}
                        <img src={fishweight} alt="Weight Scale" className="scale-img" />

                                                {/* Temporary ruler start marker */}
                        <div 
                            className="debug-marker start-debug" 
                            style={{ left: `${RULER_START}%` }}
                        >
                        <span>START</span>
                        </div>

                        {/* Temporary ruler end marker */}
                        <div
                            className="debug-marker end-debug"
                            style={{ left: `${RULER_END}%` }}
                        >
                            <span>END</span>
                        </div>

                        {/* Average Marker */}
                        <div className="scale-marker avg-marker-weight" style={{ left: `${weightAvgPosition}%` }}>
                            <span className="marker-text">Avg ({statsData.avgWeight} lbs)</span>
                            <span className="marker-line"></span>
                        </div>

                        {/* Record Marker */}
                        <div className="scale-marker record-marker-weight" style={{ left: `${weightBestPosition}%` }}>
                            <span className="marker-text">Record ({statsData.heaviestFish} lbs)</span>
                            <span className="marker-line record-line"></span>
                        </div>
                    </div>
                </div>
                
            </section>
        </main>
    );
}

export default Stats;