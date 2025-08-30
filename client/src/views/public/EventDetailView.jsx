import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../api/ApiService.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRouter } from '../../hooks/useRouter.jsx';
import EventHeader from '../../components/EventHeader.jsx';
import EventTags from '../../components/EventTags.jsx';
import EventActions from '../../components/EventActions.jsx';
import CommentSection from '../../components/CommentSection.jsx';
import RelatedEvents from '../../components/RelatedEvents.jsx';
import RsvpModal from '../../components/RsvpModal.jsx';
import { useAuth } from "../../contexts/AuthContext.jsx";

const EventDetailView = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRsvpModal, setShowRsvpModal] = useState(false);

    const { showToast } = useToast();
    const { getParams, navigate } = useRouter();
    const { user } = useAuth();
    const { id: eventId } = getParams('/events/:id');

    const loadEvent = useCallback(async (signal) => {
        if (!eventId) return;
        setLoading(true);
        try {
            const data = await ApiService.getEvent(eventId, { signal });
            setEvent(data);
        } catch (err) {
                showToast('Failed to load event', 'error');
                navigate('/');
        } finally {
            if (!signal || !signal.aborted) {
                setLoading(false);
            }
        }
    }, [eventId, navigate, showToast]);

    useEffect(() => {
        const controller = new AbortController();
        loadEvent(controller.signal);
        return () => controller.abort();
    }, [loadEvent]);

    const handleApiAction = useCallback(async (apiCall, successMsg, errorMsg) => {
        try {
            await apiCall();
            showToast(successMsg, 'success');
            await loadEvent();
        } catch (err) {
            showToast(err?.message || errorMsg, 'error');
        }
    }, [loadEvent, showToast]);

    const onEventReaction = (type) => {
        const apiCall = type === 'like'
            ? () => ApiService.likeEvent(eventId)
            : () => ApiService.dislikeEvent(eventId);
        handleApiAction(apiCall, 'Reaction saved!', 'You have already reacted to this event');
    };

    const onCommentReaction = (commentId, type) => {
        const apiCall = type === 'like'
            ? () => ApiService.likeComment(commentId)
            : () => ApiService.dislikeComment(commentId);
        handleApiAction(apiCall, 'Reaction saved!', 'You have already reacted to this comment');
    };

    const onCommentAdded = () => {
        showToast('Comment added successfully!', 'success');
        loadEvent();
    };

    const onDeleteComment = (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        handleApiAction(() => ApiService.deleteComment(commentId), 'Comment deleted.', 'Failed to delete comment.');
    };

    const handleRsvp = (email) => {
        const cleaned = (email || '').trim();
        if (!/^\S+@\S+\.\S+$/.test(cleaned)) {
            return showToast('Please enter a valid email.', 'error');
        }
        setShowRsvpModal(false);
        handleApiAction(() => ApiService.registerForEvent(eventId, cleaned), 'Registration successful!', 'Registration failed');
    };

    const handleTagClick = useCallback((tag) => {
        navigate('/', { tagId: tag.tag_id, tagName: tag.name });
    }, [navigate]);

    if (loading && !event) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div>
            <button onClick={() => navigate('/')} className="button secondary" style={{ marginBottom: '1rem' }}>
                ← Back to All Events
            </button>

            <EventHeader event={event} />
            <EventTags tags={event.tags} onTagClick={handleTagClick} />
            <p className="event-detail-description">{event.description}</p>
            <EventActions event={event} onReaction={onEventReaction} onRsvpClick={() => setShowRsvpModal(true)} />

            <CommentSection
                eventId={eventId}
                comments={event.comments}
                commentsReactions={event.commentsReactions}
                onCommentAdded={onCommentAdded}
                onCommentReaction={onCommentReaction}
                user={user}
                onDeleteComment={onDeleteComment}
            />

            <RelatedEvents events={event.related_events} />
            {showRsvpModal && <RsvpModal onRsvp={handleRsvp} onCancel={() => setShowRsvpModal(false)} />}
        </div>
    );
};

export default EventDetailView;