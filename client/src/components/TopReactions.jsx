import React, { useEffect, useState } from 'react';
import ApiService from '../api/ApiService.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useRouter } from '../hooks/useRouter.jsx';


const TopReactions = () => {
    const [events, setEvents] = useState([]);
    const { showToast } = useToast();
    const { navigate } = useRouter();


    useEffect(() => {
        let cancelled = false;
        const loadTopEvents = async () => {
            try {
                const data = await ApiService.getTopReactionEvents();
                if (!cancelled) setEvents(data || []);
            } catch (error) {
                showToast('Could not load top events.', 'error');
            }
        };
        loadTopEvents();
        return () => { cancelled = true; };
    }, [showToast]);

    return (
        <div className="top-reactions-panel">
            <h3>Most Reactions</h3>
            {events.map(event => (
                <div key={event.event_id} className="reaction-item">
                    <button onClick={() => navigate(`/events/${event.event_id}`)}>
                        {event.title}
                    </button>
                </div>
            ))}
        </div>
    );
};


export default TopReactions;