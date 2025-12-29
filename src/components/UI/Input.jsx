import React from 'react';
import './Input.css';

const Input = ({ label, id, error, className = '', ...props }) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                id={id}
                className={`glass-input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};

export default Input;
