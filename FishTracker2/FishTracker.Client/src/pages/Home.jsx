import './Home.css'

function Home() {
    return (
        <main className="home">

            <header className="home-header">
                <h1>FishTracker</h1>
            </header>

            <section className="aquarium">
                <div className="aquarium-water">
                    <div className="fish fish1">🐟</div>
                    <div className="fish fish2">🐠</div>
                    <div className="fish fish3">🐟</div>
                </div>
            </section>

            <section className="bottom">
                <div className="description">
                    Ready to begin your fishing journey?
                </div>
            </section>

        </main>
    )
}

export default Home