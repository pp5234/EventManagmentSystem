import React, { useState, useCallback, memo } from 'react';
import ApiService from '../api/ApiService.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

const COMMENTS_PER_PAGE = 10;

const CommentItem = memo(function CommentItem({ comment, reaction, onReact, user, onDelete }) {
    return (
        <div className="comment">
            <div className="comment-header">
                <strong>{comment.name}</strong>
                <span>{new Date(comment.creation_date).toLocaleDateString()}</span>
            </div>
            <p>{comment.content}</p>
            <div className="comment-actions">
                <button
                    className={`reaction-button like ${reaction === 'like' ? 'active' : ''}`}
                    onClick={() => onReact(comment.comment_id, 'like')}
                >
                    👍 {comment.likes || 0}
                </button>
                <button
                    className={`reaction-button dislike ${reaction === 'dislike' ? 'active' : ''}`}
                    onClick={() => onReact(comment.comment_id, 'dislike')}
                >
                    👎 {comment.dislikes || 0}
                </button>

                {}
                {user && (
                    <button
                        className="button-sm secondary"
                        onClick={() => onDelete(comment.comment_id)}
                        style={{ marginLeft: 'auto' }}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
});const CommentSection = ({ eventId, comments = [], commentsReactions = {}, onCommentAdded, onCommentReaction, user, onDeleteComment }) => {
    const { showToast } = useToast();
    const [commentName, setCommentName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
    const [submitting, setSubmitting] = useState(false);

    const handleAddComment = useCallback(async () => {
        if (!commentName.trim() || !commentText.trim()) {
            return showToast('Name and comment text are required.', 'error');
        }
        setSubmitting(true);
        try {
            await ApiService.addComment(eventId, { name: commentName.trim(), content: commentText.trim() });
            showToast('Comment added successfully!', 'success');
            setCommentName('');
            setCommentText('');
            if (typeof onCommentAdded === 'function') onCommentAdded();
        } catch (error) {
            showToast(error?.message || 'Failed to add comment', 'error');
        } finally {
            setSubmitting(false);
        }
    }, [commentName, commentText, eventId, onCommentAdded, showToast]);


    const handleLoadMore = useCallback(() => {
        setVisibleComments(prev => prev + COMMENTS_PER_PAGE);
    }, []);


    return (
        <div className="comments-section">
            <h3>Comments</h3>
            {comments.slice(0, visibleComments).map(comment => (
                <CommentItem
                    key={comment.comment_id}
                    comment={comment}
                    reaction={commentsReactions?.[comment.comment_id]}
                    onReact={onCommentReaction}
                    user={user}
                    onDelete={onDeleteComment}
                />
            ))}

            {comments.length > visibleComments && (
                <button onClick={handleLoadMore} style={{ marginTop: '10px' }}>Load More Comments</button>
            )}

            <div style={{ marginTop: '30px' }}>
                <h3>Add Comment</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        disabled={submitting}
                    />
                </div>
                <div className="form-group">
<textarea
    placeholder="Your comment"
    rows="4"
    value={commentText}
    onChange={(e) => setCommentText(e.target.value)}
    disabled={submitting}
/>
                </div>
                <button onClick={handleAddComment} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Comment'}</button>
            </div>
        </div>
    );
};

export default CommentSection;