import './Stats.css'
import fishweight from '../assets/fishweight.png';
import fishRuler from '../assets/fishRuler.png';

function Stats() {
    // Dynamic values (can later be passed as props or fetched from state)
    const statsData = {
        totalFish: 67,
        longestFish: 42.7,
        heaviestFish: 17.9,
        avgLength: 6.3,
        avgWeight: 7.2,
        totalTrips: 52,
        timeSpent: "21d 9h 4m"
    };

    // Calculate percentages for custom progress visuals
    const maxPossibleLength = 50; // Reference max for calculating tape visual fill
    const maxPossibleWeight = 30;  // Reference max for scale visual fill

    const lengthAvgPercent = (statsData.avgLength / maxPossibleLength) * 100;
    const lengthBestPercent = (statsData.longestFish / maxPossibleLength) * 100;

    const weightAvgPercent = (statsData.avgWeight / maxPossibleWeight) * 100;
    const weightBestPercent = (statsData.heaviestFish / maxPossibleWeight) * 100;

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
                        <span className="widget-value">{statsData.timeSpent}</span>
                        <span className="widget-label">Time Spent</span>
                    </div>

                    <div className="widget">
                        <div className="widget-icon">⛵</div>
                        <span className="widget-value">{statsData.totalTrips}</span>
                        <span className="widget-label">Trips</span>
                    </div>

                    <div className="widget">
                        <div className="widget-icon">🐟</div>
                        <span className="widget-value">{statsData.totalFish}</span>
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

                        {/* Average Marker */}
                        <div className="ruler-marker avg-marker-length" style={{ left: '48%' }}>
                            <span className="marker-text">Avg ({statsData.avgLength} in)</span>
                            <span className="marker-line"></span>
                        </div>

                        {/* Record Marker */}
                        <div className="ruler-marker record-marker-length" style={{ left: '85%' }}>
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

                        {/* Average Marker */}
                        <div className="scale-marker avg-marker-weight" style={{ left: '48%' }}>
                            <span className="marker-text">Avg ({statsData.avgWeight} lbs)</span>
                            <span className="marker-line"></span>
                        </div>

                        {/* Record Marker */}
                        <div className="scale-marker record-marker-weight" style={{ left: '85%' }}>
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