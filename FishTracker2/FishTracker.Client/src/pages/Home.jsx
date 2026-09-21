import './Home.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

import trout from '../assets/trout.png'
import smallmouthBass from '../assets/smallmouthBass.png'
import largemouthBass from '../assets/largemouthBass.png'
import catfish from '../assets/catfish.png'
import bluegill from '../assets/bluegill.png'
import salmon from '../assets/salmon.png'
import stripedBass from '../assets/stripedBass.png'
import pike from '../assets/pike.png'
import gar from '../assets/gar.png'


const MAX_AQUARIUM_FISH = 25


const speciesConfig = {
    Trout: {
        label: 'Trout',
        image: trout,
        size: 52
    },

    SmallmouthBass: {
        label: 'Smallmouth Bass',
        image: smallmouthBass,
        size: 60
    },

    LargemouthBass: {
        label: 'Largemouth Bass',
        image: largemouthBass,
        size: 65
    },

    Catfish: {
        label: 'Catfish',
        image: catfish,
        size: 65
    },

    Bluegill: {
        label: 'Bluegill',
        image: bluegill,
        size: 45
    },

    Salmon: {
        label: 'Salmon',
        image: salmon,
        size: 62
    },

    StripedBass: {
        label: 'Striped Bass',
        image: stripedBass,
        size: 65
    },

    Pike: {
        label: 'Pike',
        image: pike,
        size: 72
    },

    Gar: {
        label: 'Gar',
        image: gar,
        size: 75
    }
}


/*
    Fixed positions for fish in the aquarium.

    Fish do not move. Each additional fish gets
    the next position in this list.
*/
const fishPositions = [
    { left: 25, top: 35 },
    { left: 145, top: 55 },
    { left: 265, top: 40 },

    { left: 70, top: 115 },
    { left: 205, top: 125 },
    { left: 300, top: 145 },

    { left: 20, top: 195 },
    { left: 135, top: 205 },
    { left: 260, top: 215 },

    { left: 65, top: 270 },
    { left: 185, top: 280 },
    { left: 295, top: 290 },

    { left: 25, top: 340 },
    { left: 140, top: 350 },
    { left: 255, top: 345 },

    { left: 90, top: 80 },
    { left: 230, top: 90 },

    { left: 105, top: 160 },
    { left: 240, top: 175 },

    { left: 90, top: 235 },
    { left: 225, top: 250 },

    { left: 40, top: 305 },
    { left: 150, top: 315 },
    { left: 270, top: 320 },

    { left: 170, top: 20 }
]


function Home() {

    const {
        token,
        statsRefresh
    } = useAuth()


    /*
        Number of each species the user
        has actually caught.
    */
    const [caughtCounts, setCaughtCounts] =
        useState({})


    /*
        Number of each species currently
        displayed in the aquarium.
    */
    const [aquariumCounts, setAquariumCounts] =
        useState({})


    /*
        Temporary selections while the
        customization menu is open.
    */
    const [draftCounts, setDraftCounts] =
        useState({})


    const [
        showAquariumMenu,
        setShowAquariumMenu
    ] = useState(false)


    const [
        loadingFish,
        setLoadingFish
    ] = useState(true)


    const [
        fishError,
        setFishError
    ] = useState('')


    /*
        Load every fish caught by the
        currently logged-in user.
    */
    useEffect(() => {

        if (!token) {

            setCaughtCounts({})
            setAquariumCounts({})
            setLoadingFish(false)

            return
        }


        const loadFish = async () => {

            setLoadingFish(true)
            setFishError('')


            try {

                const response =
                    await fetch(
                        '/api/fish',
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )


                if (!response.ok) {

                    const errorText =
                        await response.text()

                    console.error(
                        'GET /api/fish failed:',
                        response.status,
                        errorText
                    )

                    throw new Error(
                        `Unable to load fish. Status: ${response.status}`
                    )
                }


                const fish =
                    await response.json()


                const counts = {}


                fish.forEach(
                    caughtFish => {

                        const species =
                            caughtFish.species

                        counts[species] =
                            (counts[species] || 0) + 1

                    }
                )


                setCaughtCounts(
                    counts
                )


                /*
                    If the user deletes a fish,
                    don't allow the aquarium to
                    continue displaying more of that
                    species than they own.
                */
                setAquariumCounts(
                    previous => {

                        const updated = {}

                        let remaining =
                            MAX_AQUARIUM_FISH


                        Object.keys(counts)
                            .forEach(
                                species => {

                                    const amount =
                                        Math.min(
                                            previous[species] || 0,
                                            counts[species],
                                            remaining
                                        )

                                    updated[species] =
                                        amount

                                    remaining -=
                                        amount
                                }
                            )


                        return updated
                    }
                )

            }
            catch (error) {

                console.error(
                    'Fish loading error:',
                    error
                )

                setFishError(
                    error.message
                )

            }
            finally {

                setLoadingFish(
                    false
                )

            }
        }


        loadFish()

    }, [
        token,
        statsRefresh
    ])


    /*
        Open customization popup.
    */
    const openAquariumMenu = () => {

        setDraftCounts({
            ...aquariumCounts
        })

        setShowAquariumMenu(
            true
        )
    }


    /*
        Close without saving.
    */
    const closeAquariumMenu = () => {

        setShowAquariumMenu(
            false
        )
    }


    /*
        Number of fish currently selected
        in the customization popup.
    */
    const draftTotal =
        Object.values(
            draftCounts
        )
            .reduce(
                (total, count) =>
                    total + Number(count),
                0
            )


    /*
        Change how many of a species
        should appear.
    */
    const handleCountChange = (
        species,
        newCount
    ) => {

        const numericCount =
            Number(newCount)


        const caught =
            caughtCounts[species] || 0


        const currentSpeciesCount =
            Number(
                draftCounts[species] || 0
            )


        const totalWithoutSpecies =
            draftTotal -
            currentSpeciesCount


        const remainingSpace =
            MAX_AQUARIUM_FISH -
            totalWithoutSpecies


        /*
            Cannot exceed either:

            1. Number of this species caught
            2. 25 fish total
        */
        const finalCount =
            Math.max(
                0,
                Math.min(
                    numericCount,
                    caught,
                    remainingSpace
                )
            )


        setDraftCounts(
            previous => ({
                ...previous,
                [species]: finalCount
            })
        )
    }


    /*
        Apply selections to aquarium.
    */
    const saveAquarium = () => {

        setAquariumCounts({
            ...draftCounts
        })

        setShowAquariumMenu(
            false
        )
    }


    /*
        Build the individual fish that
        should be displayed.
    */
    const displayedFish = []


    Object.entries(
        aquariumCounts
    )
        .forEach(
            ([species, count]) => {

                const config =
                    speciesConfig[species]


                if (!config) {
                    return
                }


                for (
                    let index = 0;
                    index < count;
                    index++
                ) {

                    displayedFish.push({
                        species,
                        label:
                            config.label,
                        image:
                            config.image,
                        size:
                            config.size
                    })
                }
            }
        )


    /*
        Only show species the user
        has actually caught.
    */
    const availableSpecies =
        Object.keys(
            caughtCounts
        )
            .filter(
                species =>
                    caughtCounts[species] > 0 &&
                    speciesConfig[species]
            )


    return (

        <main className="home">


            <header className="home-header">

                <h1>
                    FishTracker
                </h1>

            </header>


            <section className="aquarium">

                <div className="aquarium-water">


                    <div className="bubble bubble1"></div>
                    <div className="bubble bubble2"></div>
                    <div className="bubble bubble3"></div>
                    <div className="bubble bubble4"></div>
                    <div className="bubble bubble5"></div>


                    {displayedFish.map(
                        (fish, index) => {

                            const position =
                                fishPositions[
                                    index %
                                    fishPositions.length
                                ]


                            return (

                                <img
                                    key={`${fish.species}-${index}`}
                                    className="stationary-fish"
                                    src={fish.image}
                                    alt={fish.label}
                                    title={fish.label}
                                    style={{
                                        width:
                                            `${fish.size}px`,

                                        left:
                                            `${position.left}px`,

                                        top:
                                            `${position.top}px`
                                    }}
                                />

                            )
                        }
                    )}


                    <button
                        type="button"
                        className="aquarium-add-button"
                        onClick={
                            openAquariumMenu
                        }
                        aria-label="Customize aquarium"
                        title="Customize aquarium"
                    >
                        +
                    </button>


                    <div className="aquarium-floor"></div>


                </div>

            </section>


            <section className="bottom">

                <div className="description">
                    Ready to begin your fishing journey?
                </div>

            </section>


            {showAquariumMenu && (

                <div
                    className="aquarium-modal-overlay"
                    onClick={
                        closeAquariumMenu
                    }
                >

                    <div
                        className="aquarium-modal"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >


                        <div className="aquarium-modal-header">


                            <div>

                                <h2>
                                    Customize Aquarium
                                </h2>

                                <p>
                                    Choose which of your catches to display.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="aquarium-modal-close"
                                onClick={
                                    closeAquariumMenu
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                        </div>


                        <div className="aquarium-modal-content">


                            {loadingFish ? (

                                <div className="aquarium-message">

                                    Loading your fish...

                                </div>

                            ) : fishError ? (

                                <div className="aquarium-message aquarium-error">

                                    {fishError}

                                </div>

                            ) : availableSpecies.length === 0 ? (

                                <div className="aquarium-empty">

                                    <div className="aquarium-empty-icon">
                                        🐟
                                    </div>

                                    <h3>
                                        No fish caught yet
                                    </h3>

                                    <p>
                                        Add a catch and its species will become available here.
                                    </p>

                                </div>

                            ) : (

                                availableSpecies.map(
                                    species => {

                                        const config =
                                            speciesConfig[species]


                                        const caught =
                                            caughtCounts[species]


                                        const selected =
                                            draftCounts[species] || 0


                                        return (

                                            <div
                                                className="aquarium-species-row"
                                                key={species}
                                            >


                                                <div className="aquarium-species-info">


                                                    <div className="aquarium-species-image-wrapper">

                                                        <img
                                                            src={
                                                                config.image
                                                            }
                                                            alt=""
                                                            className="aquarium-species-image"
                                                        />

                                                    </div>


                                                    <div className="aquarium-species-text">

                                                        <span className="aquarium-species-name">

                                                            {config.label}

                                                        </span>


                                                        <span className="aquarium-species-caught">

                                                            {caught} caught

                                                        </span>

                                                    </div>


                                                </div>


                                                <select
                                                    className="aquarium-count-select"
                                                    value={
                                                        selected
                                                    }
                                                    onChange={
                                                        event =>
                                                            handleCountChange(
                                                                species,
                                                                event.target.value
                                                            )
                                                    }
                                                >

                                                    {Array.from(
                                                        {
                                                            length:
                                                                caught + 1
                                                        },
                                                        (_, number) => (

                                                            <option
                                                                key={
                                                                    number
                                                                }
                                                                value={
                                                                    number
                                                                }
                                                            >

                                                                {number}

                                                            </option>

                                                        )
                                                    )}

                                                </select>


                                            </div>

                                        )
                                    }
                                )

                            )}


                        </div>


                        <div className="aquarium-modal-footer">


                            <div
                                className={
                                    `aquarium-total ${
                                        draftTotal === MAX_AQUARIUM_FISH
                                            ? 'aquarium-total-full'
                                            : ''
                                    }`
                                }
                            >

                                <strong>
                                    {draftTotal}
                                </strong>

                                {' / '}

                                {MAX_AQUARIUM_FISH}

                                {' fish'}

                            </div>


                            <div className="aquarium-modal-buttons">


                                <button
                                    type="button"
                                    className="aquarium-cancel-button"
                                    onClick={
                                        closeAquariumMenu
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="aquarium-save-button"
                                    onClick={
                                        saveAquarium
                                    }
                                    disabled={
                                        loadingFish ||
                                        Boolean(fishError)
                                    }
                                >
                                    Save Aquarium
                                </button>


                            </div>


                        </div>


                    </div>

                </div>

            )}


        </main>

    )
}


export default Home