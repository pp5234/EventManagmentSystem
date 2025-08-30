import React, { useState, useCallback } from 'react';

const RsvpModal = ({ onRsvp, onCancel }) => {
    const [email, setEmail] = useState('');
    const handleRegister = useCallback(() => { onRsvp(email); }, [onRsvp, email]);


    return (
        <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-content">
                <h3>Register for this Event</h3>
                <p>Your email will be used to send a confirmation.</p>
                <div className="form-group">
                    <label htmlFor="rsvp-email">Email Address</label>
                    <input
                        id="rsvp-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                    />
                </div>
                <div className="modal-actions">
                    <button onClick={onCancel} className="button secondary">Cancel</button>
                    <button onClick={handleRegister} className="button">Register</button>
                </div>
            </div>
        </div>
    );
};


export default RsvpModal;