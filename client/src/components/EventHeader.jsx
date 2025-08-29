import React, { memo } from 'react';

const EventHeader = ({ event }) => {
    if (!event) return null;
    return (
        <header className="event-detail-header">
            <h1>{event.title}</h1>
            <div className="event-meta">
                <span>📅 {new Date(event.start_date).toLocaleString()}</span>
                <span>📍 {event.location}</span>
                <span>✍️ Created by {event.author_name} on {new Date(event.creation_date).toLocaleDateString()}</span>
                <span>📂 Category: {event.category_name}</span>
                <span>👁 {event.views} views</span>
            </div>
        </header>
    );
};


export default memo(EventHeader);