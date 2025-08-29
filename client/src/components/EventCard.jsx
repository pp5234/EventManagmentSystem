import React, { useMemo } from 'react';

const MetaSeparator = () => <span aria-hidden="true" style={{ margin: '0 6px' }}>|</span>;

const EventCard = React.memo(function EventCard({ event, onClick }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick && onClick();
        }
    };

    const metadata = useMemo(() => {
        const parts = [];
        if (event?.start_date) {
            const iso = new Date(event.start_date).toISOString();
            const human = new Date(event.start_date).toLocaleDateString();
            parts.push(
                <time key="date" dateTime={iso} title={human}>
                    📅 {human}
                </time>
            );
        }
        if (event?.location) {
            parts.push(<span key="location">📍 {event.location}</span>);
        }
        if (event?.category_name) {
            parts.push(<span key="category">📂 {event.category_name}</span>);
        }
        return parts;
    }, [event]);

    const description = useMemo(() => event?.description.concat("..."), [event]);

    return (
        <article
            className="card event-card"
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={onClick ? handleKeyDown : undefined}
            aria-label={event?.title ? `Open event ${event.title}` : 'Event'}
        >
            <h3 style={{ marginBottom: 8 }}>{event?.title || 'Untitled event'}</h3>

            <p className="event-card-description" style={{ marginBottom: 8 }}>
                {description}
            </p>

            {metadata.length > 0 && (
                <div className="event-meta" aria-hidden="false" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {metadata.map((item, idx) => (
                        <React.Fragment key={idx}>
                            {idx > 0 && <MetaSeparator />}
                            {item}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </article>
    );
});

export default EventCard;
