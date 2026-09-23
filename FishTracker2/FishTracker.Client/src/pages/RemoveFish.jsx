import './RemoveFish.css'
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


const fishImages = {
    Trout: trout,
    SmallmouthBass: smallmouthBass,
    LargemouthBass: largemouthBass,
    Catfish: catfish,
    Bluegill: bluegill,
    Salmon: salmon,
    StripedBass: stripedBass,
    Pike: pike,
    Gar: gar
}


function RemoveFish() {

    const {
        token,
        refreshStats,
        statsRefresh
    } = useAuth()


    const [fish, setFish] = useState([])
    const [selectedFish, setSelectedFish] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showSuccess, setShowSuccess] = useState(false)
    const [deleting, setDeleting] = useState(false)


    useEffect(() => {

        async function loadFish() {

            try {

                setError('')


                const response = await fetch(
                    '/api/fish',
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )


                if (!response.ok) {

                    throw new Error(
                        'Failed to load fish.'
                    )

                }


                const data =
                    await response.json()


                setFish(data)

            } catch (error) {

                console.error(error)


                setError(
                    'Could not load your fish.'
                )

            } finally {

                setLoading(false)

            }
        }


        if (token) {

            loadFish()

        }

    }, [
        token,
        statsRefresh
    ])


    const formatSpecies = (species) => {

        return species.replace(
            /([a-z])([A-Z])/g,
            '$1 $2'
        )

    }


    const handleDelete = async () => {

        if (!selectedFish || deleting) {

            return

        }


        setDeleting(true)
        setError('')


        try {

            const fishId =
                selectedFish.fishId


            const response = await fetch(
                `/api/fish/${fishId}`,
                {
                    method: 'DELETE',

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )


            if (!response.ok) {

                throw new Error(
                    'Failed to delete fish.'
                )

            }


            /*
                Remove the deleted fish from
                the displayed list.
            */
            setFish(
                currentFish =>
                    currentFish.filter(
                        fishRecord =>
                            fishRecord.fishId !==
                            fishId
                    )
            )


            /*
                Close the confirmation popup.
            */
            setSelectedFish(null)


            /*
                Refresh stats and any other
                components using statsRefresh.
            */
            refreshStats()


            /*
                Show success popup.
            */
            setShowSuccess(true)


            /*
                Automatically hide it after
                two seconds.
            */
            setTimeout(() => {

                setShowSuccess(false)

            }, 2000)

        } catch (error) {

            console.error(error)


            setError(
                'Could not remove the fish.'
            )

        } finally {

            setDeleting(false)

        }
    }


    if (loading) {

        return (

            <main className="remove-fish-page">

                <p className="remove-message">
                    Loading fish...
                </p>

            </main>

        )
    }


    return (

        <main className="remove-fish-page">


            <header className="remove-fish-header">

                <h1>
                    Remove Fish
                </h1>

                <p>
                    Select a fish to remove from your log.
                </p>

            </header>


            {error && (

                <p className="remove-error">
                    {error}
                </p>

            )}


            <section className="fish-list">


                {fish.length === 0 ? (

                    <p className="remove-message">
                        You haven't recorded any fish yet.
                    </p>

                ) : (

                    fish.map(
                        fishRecord => (

                            <div
                                className="fish-row"
                                key={fishRecord.fishId}
                            >


                                <div className="fish-row-icon">

                                    <img
                                        src={
                                            fishImages[
                                                fishRecord.species
                                            ]
                                        }
                                        alt={
                                            formatSpecies(
                                                fishRecord.species
                                            )
                                        }
                                    />

                                </div>


                                <div className="fish-column species-column">

                                    <span className="column-label">
                                        Species
                                    </span>

                                    <span className="column-value">

                                        {formatSpecies(
                                            fishRecord.species
                                        )}

                                    </span>

                                </div>


                                <div className="fish-column">

                                    <span className="column-label">
                                        Length
                                    </span>

                                    <span className="column-value">

                                        {fishRecord.length} in

                                    </span>

                                </div>


                                <div className="fish-column">

                                    <span className="column-label">
                                        Weight
                                    </span>

                                    <span className="column-value">

                                        {fishRecord.weight} lbs

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() =>
                                        setSelectedFish(
                                            fishRecord
                                        )
                                    }
                                >
                                    Remove
                                </button>


                            </div>

                        )
                    )

                )}


            </section>


            {selectedFish && (

                <div
                    className="modal-overlay"
                    onClick={() => {

                        if (!deleting) {

                            setSelectedFish(null)

                        }

                    }}
                >


                    <div
                        className="delete-modal"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >


                        <button
                            type="button"
                            className="modal-close"
                            onClick={() =>
                                setSelectedFish(null)
                            }
                            aria-label="Close"
                            disabled={deleting}
                        >
                            ×
                        </button>


                        <h2>
                            Remove This Fish?
                        </h2>


                        <div className="modal-fish-summary">


                            <div className="modal-fish-icon">

                                <img
                                    src={
                                        fishImages[
                                            selectedFish.species
                                        ]
                                    }
                                    alt={
                                        formatSpecies(
                                            selectedFish.species
                                        )
                                    }
                                />

                            </div>


                            <h3>

                                {formatSpecies(
                                    selectedFish.species
                                )}

                            </h3>


                        </div>


                        <div className="modal-stats">


                            <div>

                                <span className="modal-stat-label">
                                    Length
                                </span>

                                <span className="modal-stat-value">

                                    {selectedFish.length} in

                                </span>

                            </div>


                            <div>

                                <span className="modal-stat-label">
                                    Weight
                                </span>

                                <span className="modal-stat-value">

                                    {selectedFish.weight} lbs

                                </span>

                            </div>


                        </div>


                        <p className="modal-warning">

                            Are you sure you want to remove this fish?
                            This action cannot be undone.

                        </p>


                        <div className="modal-actions">


                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setSelectedFish(null)
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >

                                {deleting
                                    ? 'Deleting...'
                                    : 'Delete'
                                }

                            </button>


                        </div>


                    </div>


                </div>

            )}


            {showSuccess && (

                <div className="remove-success-overlay">


                    <div className="remove-success-popup">


                        <div className="remove-success-check">
                            ✓
                        </div>


                        <h2>
                            Fish Removed!
                        </h2>


                        <p>
                            Your catch was removed successfully.
                        </p>


                    </div>


                </div>

            )}


        </main>

    )
}


export default RemoveFish