import React, { memo, useCallback } from 'react';

const EventTags = ({ tags, onTagClick }) => {
    if (!tags || tags.length === 0) return null;

    const handleClick = useCallback((tag) => () => onTagClick(tag), [onTagClick]);

    return (
        <div className="tags-container">
            {tags.map(tag => (
                <button key={tag.tag_id} type="button" className="tag" onClick={handleClick(tag)}>
                    {tag.name}
                </button>
            ))}
        </div>
    );
};

export default memo(EventTags);