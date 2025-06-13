//Loader.js
import React from "react";
import "./Loader.css";

export function Loader(props) {
    return (
        <div className="blur-overlay">
            <div className="loader">
                <div className="spinner" />
            </div>
            <div className='loader-desc'>
                <p>{props.loadingDesc}</p>
            </div>
        </div>
    );
}


