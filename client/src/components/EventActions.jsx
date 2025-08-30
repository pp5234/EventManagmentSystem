import React from 'react';

const EventActions = ({ event, onReaction, onRsvpClick }) => (
    <div className="actions-container">
        <button
            className={`reaction-button like ${event.eventReaction === 'like' ? 'active' : ''}`}
            onClick={() => onReaction('like')}
        >
            👍 <span>{event.likes || 0}</span>
        </button>
        <button
            className={`reaction-button dislike ${event.eventReaction === 'dislike' ? 'active' : ''}`}
            onClick={() => onReaction('dislike')}
        >
            👎 <span>{event.dislikes || 0}</span>
        </button>
        <button
            onClick={onRsvpClick}
            disabled={event.capacity && event.rsvp_count >= event.capacity}
            style={{ marginLeft: 'auto' }}
        >
            {event.capacity
                ? `Register (${event.rsvp_count || 0}/${event.capacity})`
                : 'Register'}
        </button>
    </div>
);

export default EventActions;