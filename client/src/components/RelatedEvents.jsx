import React, { memo, useCallback } from 'react';
import { useRouter } from '../hooks/useRouter.jsx';
import EventCard from './EventCard.jsx';


const RelatedEvents = ({ events }) => {
    const { navigate } = useRouter();
    const goTo = useCallback((id) => () => navigate(`/events/${id}`), [navigate]);

    if (!events || events.length === 0) return null;

    return (
        <div style={{ marginTop: '40px' }}>
            <h3>Read More...</h3>
            {events.map(relEvent => (
                <EventCard
                    key={relEvent.event_id}
                    event={relEvent}
                    onClick={goTo(relEvent.event_id)}
                />
            ))}
        </div>
    );
};

export default memo(RelatedEvents);