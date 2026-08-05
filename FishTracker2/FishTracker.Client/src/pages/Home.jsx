import './Home.css'
function Home() {
    return (
        <main className = 'home'>
            <section className = 'top'>
                <div className = 'title'>FishTracker</div>
            </section>


            <section className = 'bottom'>
                <div className='description'>Ready to begin your fishing journey goyim?</div>

                <nav className = 'buttons'>
                    <button>Home</button>
                    <button>Aquarium</button>
                    <button>My Gear</button>
                    <button>Leaderboard</button>
                    <button>Profile</button>
                    <button>Settings</button>
                </nav>

            </section>
            
        </main>



    );
}
export default Home