import './AddFish.css'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function AddFish() {

    const { token, refreshStats } = useAuth()

    const [species, setSpecies] = useState('')
    const [length, setLength] = useState('')
    const [weight, setWeight] = useState('')

    const [showSuccess, setShowSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)


    async function handleSubmit(e) {

        e.preventDefault()

        setSubmitting(true)

        try {

            const response = await fetch('/api/fish', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    weight: Number(weight),
                    length: Number(length),
                    species: species
                })
            })


            if (response.ok) {

                setSpecies('')
                setLength('')
                setWeight('')

                refreshStats()

                /*
                    Show confirmation popup.
                */
                setShowSuccess(true)


                /*
                    Automatically hide it after
                    two seconds.
                */
                setTimeout(() => {

                    setShowSuccess(false)

                }, 2000)

            } else {

                console.log('Failed to add fish.')

            }

        } catch (error) {

            console.error(
                'Could not connect to server:',
                error
            )

        } finally {

            setSubmitting(false)

        }
    }


    return (

        <main className="add-fish">


            <header className="add-fish-header">

                <h1>
                    Add Fish
                </h1>

                <p>
                    Record your latest catch
                </p>

            </header>


            <form
                className="fish-form"
                onSubmit={handleSubmit}
            >


                <div className="form-group">

                    <label htmlFor="species">
                        Species{' '}
                        <span className="required">
                            *
                        </span>
                    </label>


                    <select
                        id="species"
                        name="species"
                        value={species}
                        onChange={
                            (e) =>
                                setSpecies(e.target.value)
                        }
                        required
                    >

                        <option value="">
                            Select a species
                        </option>

                        <option value="Trout">
                            Trout
                        </option>

                        <option value="SmallmouthBass">
                            Smallmouth Bass
                        </option>

                        <option value="LargemouthBass">
                            Largemouth Bass
                        </option>

                        <option value="Catfish">
                            Catfish
                        </option>

                        <option value="Bluegill">
                            Bluegill
                        </option>

                        <option value="Salmon">
                            Salmon
                        </option>

                        <option value="StripedBass">
                            Striped Bass
                        </option>

                        <option value="Pike">
                            Pike
                        </option>

                        <option value="Gar">
                            Gar
                        </option>

                    </select>

                </div>


                <div className="form-group">

                    <label htmlFor="length">
                        Length{' '}
                        <span className="required">
                            *
                        </span>
                    </label>


                    <div className="input-with-unit">

                        <input
                            id="length"
                            name="length"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.0"
                            value={length}
                            onChange={
                                (e) =>
                                    setLength(e.target.value)
                            }
                            required
                        />

                        <span>
                            in
                        </span>

                    </div>

                </div>


                <div className="form-group">

                    <label htmlFor="weight">
                        Weight{' '}
                        <span className="required">
                            *
                        </span>
                    </label>


                    <div className="input-with-unit">

                        <input
                            id="weight"
                            name="weight"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.0"
                            value={weight}
                            onChange={
                                (e) =>
                                    setWeight(e.target.value)
                            }
                            required
                        />

                        <span>
                            lbs
                        </span>

                    </div>

                </div>


                <button
                    type="submit"
                    className="add-fish-button"
                    disabled={submitting}
                >

                    {submitting
                        ? 'Adding Fish...'
                        : 'Add Fish'
                    }

                </button>


            </form>


            {showSuccess && (

                <div className="fish-success-overlay">

                    <div className="fish-success-popup">

                        <div className="fish-success-check">
                            ✓
                        </div>

                        <h2>
                            Fish Added!
                        </h2>

                        <p>
                            Your catch was added successfully.
                        </p>

                    </div>

                </div>

            )}


        </main>

    )
}

export default AddFish