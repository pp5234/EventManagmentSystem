import React, { useMemo } from 'react';

const makePageItems = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const items = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    if (start > 2) items.push('left-ellipsis');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 1) items.push('right-ellipsis');
    items.push(total);
    return items;
};

const PageButton = ({ page, current, disabled, onClick }) => {
    const isActive = page === current;
    return (
        <button
            type="button"
            className={`btn ${isActive ? 'active' : ''}`}
            onClick={() => onClick(page)}
            aria-current={isActive ? 'page' : undefined}
            disabled={disabled || isActive}
        >
            {page}
        </button>
    );
};

const Pagination = React.memo(function Pagination({ currentPage, totalPages, onPageChange, loading = false }) {
    if (!totalPages || totalPages <= 1) return null;

    const items = useMemo(() => makePageItems(currentPage, totalPages), [currentPage, totalPages]);

    const go = (n) => {
        if (n < 1 || n > totalPages || n === currentPage) return;
        onPageChange(n);
    };

    return (
        <nav className="pagination" aria-label="Pagination navigation" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
            <button
                type="button"
                className="btn"
                onClick={() => go(currentPage - 1)}
                disabled={currentPage === 1 || !!loading}
                aria-label="Previous page"
            >
                Previous
            </button>

            {items.map((it, idx) => {
                if (it === 'left-ellipsis' || it === 'right-ellipsis') {
                    return <span key={it + idx} aria-hidden="true" style={{ padding: '6px 8px' }}>…</span>;
                }
                return <PageButton key={it} page={it} current={currentPage} onClick={go} disabled={!!loading} />;
            })}

            <button
                type="button"
                className="btn"
                onClick={() => go(currentPage + 1)}
                disabled={currentPage === totalPages || !!loading}
                aria-label="Next page"
            >
                Next
            </button>

            <span aria-live="polite" style={{ marginLeft: 12, color: 'inherit' }}>
        Page {currentPage} of {totalPages}
      </span>
        </nav>
    );
});

export default Pagination;
