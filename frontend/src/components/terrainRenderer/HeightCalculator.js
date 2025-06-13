//HeightCalculator.js
import React, { useState, useEffect } from 'react';

const HeightCalculator = (size) => {
    const [kilometers, setKilometers] = useState(1);
    const [exponent, setExponent] = useState(1);
    const [heightMultiplier, setHeightMultiplier] = useState(20);

    useEffect(() => {
        const updateValues = () => {
            const newExponent = parseFloat(document.getElementById("exponent-input").value) || 1;
            const newHeightMultiplier = parseFloat(document.getElementById("heightMultiplierSlider").value) || 20;
            setExponent(newExponent);
            setHeightMultiplier(newHeightMultiplier);
        };

        // Add event listeners
        document.getElementById("exponent-input").addEventListener('change', updateValues);
        document.getElementById("heightMultiplierSlider").addEventListener('change', updateValues);

        // Initial update
        updateValues();

        // Cleanup function
        return () => {
            document.getElementById("exponent-input").removeEventListener('change', updateValues);
            document.getElementById("heightMultiplierSlider").removeEventListener('change', updateValues);
        };
    }, []);

    const terrainSize = size.size || 2000;


    const highestPoint = parseFloat((((Math.pow(heightMultiplier, exponent) * kilometers) / (terrainSize - 1)) * 1000).toFixed(1));

    return (
        <div className="height-calculator-container">
            <div className="control-label">
                Side Length:
                <input
                    type="number"
                    min="0"
                    step="1.0"
                    value={kilometers}
                    onChange={e => {
                        const newKilometers = parseFloat(e.target.value) || 0;
                        setKilometers(newKilometers);
                        localStorage.setItem('kilometers', newKilometers.toString());
                    }}
                    className="side-length-input"
                /> km
            </div>
            <p>Peak: {highestPoint} m</p>
        </div>
    );
};

export default HeightCalculator;
