import './AddFish.css'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext';

//started here
function AddFish() {
    const { user, refreshStats } = useAuth();
    const [species, setSpecies] = useState('');
    const [length, setLength] = useState('');
    const [weight, setWeight] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await fetch('/api/fish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.userId,
                weight: Number(weight),
                length: Number(length),
                species: species
            })
        });

        if (response.ok) {
            console.log("Fish added successfully!");

            setSpecies('');
            setLength('');
            setWeight('');
            refreshStats();
        } else {
            console.log("Failed to add fish.");
        }
    }

    return (
        <main className="add-fish">

            <header className="add-fish-header">
                <h1>Add Fish</h1>
                <p>Record your latest catch</p>
            </header>

            <form className="fish-form" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="species">
                        Species <span className="required">*</span>
                    </label>

                    <select
                        id="species"
                        name="species"
                        value={species}
                        onChange={(e) => setSpecies(e.target.value)}
                        required
                    >
                        <option value="">Select a species</option>
                        <option value="SmallmouthBass">SmallmouthBass</option>
                        <option value="LargemouthBass">LargemouthBass</option>
                        <option value="Trout">Trout</option>
                        <option value="Catfish">Catfish</option>
                        <option value="Salmon">Salmon</option>
                        <option value="Bluegill">Bluegill</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="length">
                        Length <span className="required">*</span>
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
                            onChange={(e) => setLength(e.target.value)}
                            required
                        />
                        <span>in</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="weight">
                        Weight <span className="required">*</span>
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
                            onChange={(e) => setWeight(e.target.value)}
                            required
                        />
                        <span>lbs</span>
                    </div>
                </div>

                <button type="submit" className="add-fish-button">
                    Add Fish
                </button>

            </form>

        </main>
    )
}

export default AddFish