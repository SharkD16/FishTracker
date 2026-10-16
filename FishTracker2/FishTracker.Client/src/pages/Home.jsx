import './Home.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

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
        statsRefresh,
        refreshStats
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
        Fishing trip state.
    */
    const [
        activeTrip,
        setActiveTrip
    ] = useState(null)


    const [
        tripLoading,
        setTripLoading
    ] = useState(true)


    const [
        tripActionLoading,
        setTripActionLoading
    ] = useState(false)


    const [
        showTripConfirm,
        setShowTripConfirm
    ] = useState(false)


    const [
        tripError,
        setTripError
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
                        `${API_BASE_URL}/api/fish`,
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
        Check whether the current user already
        has an active fishing trip.

        This allows the trip state to survive
        refreshing the page.
    */
    useEffect(() => {

        if (!token) {

            setActiveTrip(null)
            setTripLoading(false)

            return
        }


        const loadCurrentTrip = async () => {

            setTripLoading(true)
            setTripError('')


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/trips/current`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )


                /*
                    204 means the user does not
                    currently have an active trip.
                */
                if (response.status === 204) {

                    setActiveTrip(null)

                    return
                }


                if (!response.ok) {

                    const errorText =
                        await response.text()

                    console.error(
                        'GET /api/trips/current failed:',
                        response.status,
                        errorText
                    )

                    throw new Error(
                        `Unable to load fishing trip. Status: ${response.status}`
                    )
                }


                const trip =
                    await response.json()


                setActiveTrip(
                    trip
                )

            }
            catch (error) {

                console.error(
                    'Trip loading error:',
                    error
                )

                setTripError(
                    error.message
                )

            }
            finally {

                setTripLoading(
                    false
                )

            }
        }


        loadCurrentTrip()

    }, [token])


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
        Open the fishing trip confirmation popup.
    */
    const openTripConfirmation = () => {

        setTripError('')

        setShowTripConfirm(
            true
        )
    }


    /*
        Close the fishing trip confirmation popup.
    */
    const closeTripConfirmation = () => {

        if (tripActionLoading) {
            return
        }

        setShowTripConfirm(
            false
        )
    }


    /*
        Start or stop a fishing trip depending
        on whether the user currently has an
        active trip.
    */
    const handleTripAction = async () => {

        if (
            !token ||
            tripActionLoading
        ) {
            return
        }


        setTripActionLoading(true)
        setTripError('')


        try {

            const isStopping =
                Boolean(activeTrip)


            const endpoint =
                isStopping
                    ? `${API_BASE_URL}/api/trips/end`
                    : `${API_BASE_URL}/api/trips/start`


            const response =
                await fetch(
                    endpoint,
                    {
                        method: 'POST',
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


            if (!response.ok) {

                let message =
                    isStopping
                        ? 'Unable to stop fishing trip.'
                        : 'Unable to start fishing trip.'


                try {

                    const data =
                        await response.json()


                    if (data.message) {

                        message =
                            data.message
                    }

                }
                catch {

                    /*
                        Keep the default error message
                        if the response is not JSON.
                    */

                }


                throw new Error(
                    message
                )
            }


            const trip =
                await response.json()


            /*
                If we just stopped the trip,
                there is no longer an active trip.

                If we just started one, save the
                returned trip as the active trip.
            */
            if (isStopping) {

                setActiveTrip(
                    null
                )

            }
            else {

                setActiveTrip(
                    trip
                )

            }


            setShowTripConfirm(
                false
            )


            /*
                Ending a trip changes the user's
                trip statistics, so refresh Stats.
            */
            if (
                isStopping &&
                refreshStats
            ) {

                refreshStats()

            }

        }
        catch (error) {

            console.error(
                'Fishing trip error:',
                error
            )

            setTripError(
                error.message
            )

        }
        finally {

            setTripActionLoading(
                false
            )

        }
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

                    {activeTrip
                        ? 'Your fishing trip is in progress.'
                        : 'Ready to begin your fishing journey?'}

                </div>


                <button
                    type="button"
                    className={
                        `fishing-trip-button ${
                            activeTrip
                                ? 'fishing-trip-button-stop'
                                : 'fishing-trip-button-start'
                        }`
                    }
                    onClick={
                        openTripConfirmation
                    }
                    disabled={
                        tripLoading ||
                        tripActionLoading ||
                        !token
                    }
                >

                    {tripLoading
                        ? 'Loading...'
                        : activeTrip
                            ? 'Stop Fishing Trip'
                            : 'Start Fishing Trip'}

                </button>


                {tripError && (

                    <div className="fishing-trip-error">

                        {tripError}

                    </div>

                )}

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


            {showTripConfirm && (

                <div
                    className="trip-confirm-overlay"
                    onClick={
                        closeTripConfirmation
                    }
                >

                    <div
                        className="trip-confirm-popup"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >


                        <div className="trip-confirm-icon">

                            {activeTrip
                                ? '🎣'
                                : '🐟'}

                        </div>


                        <h2>

                            {activeTrip
                                ? 'Stop Fishing Trip?'
                                : 'Start Fishing Trip?'}

                        </h2>


                        <p>

                            {activeTrip
                                ? 'Are you sure you want to end your current fishing trip?'
                                : 'Are you ready to begin a new fishing trip?'}

                        </p>


                        <div className="trip-confirm-buttons">


                            <button
                                type="button"
                                className="trip-confirm-cancel"
                                onClick={
                                    closeTripConfirmation
                                }
                                disabled={
                                    tripActionLoading
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    activeTrip
                                        ? 'trip-confirm-stop'
                                        : 'trip-confirm-start'
                                }
                                onClick={
                                    handleTripAction
                                }
                                disabled={
                                    tripActionLoading
                                }
                            >

                                {tripActionLoading
                                    ? activeTrip
                                        ? 'Stopping...'
                                        : 'Starting...'
                                    : activeTrip
                                        ? 'Stop Trip'
                                        : 'Start Trip'}

                            </button>


                        </div>


                    </div>

                </div>

            )}


        </main>

    )
}


export default Home