import React, { useState, useEffect } from 'react';
import ApiService from '../../api/ApiService.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRouter } from '../../hooks/useRouter.jsx';
import EventCard from '../../components/EventCard.jsx';
import Pagination from '../../components/Pagination.jsx';

const EVENTS_PER_PAGE = 10;

const normalizeResponse = (resp, view, page, selectedCategory) => {
    if (Array.isArray(resp)) {
        const totalItems = resp.length;
        const tp = Math.max(1, Math.ceil(totalItems / EVENTS_PER_PAGE));
        const start = (page - 1) * EVENTS_PER_PAGE;
        return { events: resp.slice(start, start + EVENTS_PER_PAGE), categories: [], totalPages: tp };
    }
    if (resp && resp.data) {
        if (view === 'categories' && !selectedCategory) {
            return { events: [], categories: resp.data || [], totalPages: resp.pagination?.totalPages || 1 };
        }
        return { events: resp.data || [], categories: [], totalPages: resp.pagination?.totalPages || 1 };
    }
    return { events: [], categories: [], totalPages: 1 };
};

const titleFor = (view, { selectedTag, query, selectedCategory, selectedCategoryName }) => {
    if (selectedTag) return `Events tagged with "${selectedTag.name}"`;
    if (query) return `Search Results for "${query}"`;
    if (view === 'popular') return 'Most Attended Events';
    if (view === 'categories') {
        if (selectedCategory) {
            if (selectedCategoryName) return `Events in "${selectedCategoryName}" Category`;
            return 'Events in Selected Category';
        }
        return 'Event Categories';
    }
    return 'Latest Events';
};

const PaginatedEventView = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('latest');
    const [searchQuery, setSearchQuery] = useState('');
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const { showToast } = useToast();
    const { navigate, locationState } = useRouter();

    useEffect(() => {
        if (locationState?.tagId && locationState?.tagName) {
            setView('tag');
            setSelectedTag({ id: locationState.tagId, name: locationState.tagName });
            setSelectedCategory(null);
            setSelectedCategoryName(null);
            setQuery('');
            setPage(1);
            navigate(window.location.pathname, {}, { replace: true });
        }
    }, [locationState]);

    useEffect(() => {
        if (view === 'latest' && locationState?.tagId) return;
        let cancelled = false;
        setLoading(true);

        const fetchData = async () => {
            try {
                let resp;
                switch (view) {
                    case 'popular':
                        resp = await ApiService.getPopularEvents();
                        break;
                    case 'search':
                        resp = query ? await ApiService.searchEvents(query, page, EVENTS_PER_PAGE) : { data: [], pagination: { totalPages: 1 } };
                        break;
                    case 'categories':
                        resp = selectedCategory
                            ? await ApiService.getEventsByCategory(selectedCategory, page, EVENTS_PER_PAGE)
                            : await ApiService.getCategories(page, EVENTS_PER_PAGE);
                        break;
                    case 'tag':
                        resp = selectedTag?.id ? await ApiService.getEventsByTag(selectedTag.id, page, EVENTS_PER_PAGE) : { data: [], pagination: { totalPages: 1 } };
                        break;
                    default:
                        resp = await ApiService.getEvents(page, EVENTS_PER_PAGE);
                }
                if (cancelled) return;
                const { events: evs, categories: cats, totalPages: tp } = normalizeResponse(resp, view, page, selectedCategory);
                setEvents(evs);
                setCategories(cats);
                setTotalPages(tp);
            } catch (err) {
                if (!cancelled) {
                    showToast('Failed to load data', 'error');
                    setEvents([]);
                    setCategories([]);
                    setTotalPages(1);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [view, page, query, selectedCategory, selectedTag, showToast, locationState]);

    const submitSearch = (e) => {
        e.preventDefault();
        const t = (searchQuery || '').trim();
        if (!t) return;
        setQuery(t);
        setView('search');
        setPage(1);
        setSelectedCategory(null);
        setSelectedCategoryName(null);
        setSelectedTag(null);
    };

    const clearFiltersAndChangeView = (newView = 'latest') => {
        setView(newView);
        setPage(1);
        setSelectedCategory(null);
        setSelectedCategoryName(null);
        setSelectedTag(null);
        setQuery('');
        setSearchQuery('');
    };

    const onCategoryClick = (catId, catName) => {
        setSelectedCategory(catId);
        setSelectedCategoryName(catName || null);
        setView('categories');
        setPage(1);
    };

    return (
        <>
            <div className="view-navigation">
                <button onClick={() => clearFiltersAndChangeView('latest')} className={view === 'latest' && !selectedTag ? 'active' : ''}>Latest</button>
                <button onClick={() => clearFiltersAndChangeView('popular')} className={view === 'popular' ? 'active' : ''}>Most Attended</button>
                <button onClick={() => clearFiltersAndChangeView('categories')} className={view === 'categories' ? 'active' : ''}>Categories</button>
            </div>

            <form className="search-bar" onSubmit={submitSearch}>
                <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button type="submit">Search</button>
            </form>

            <h2>{titleFor(view, { selectedTag, query, selectedCategory, categories, selectedCategoryName })}</h2>

            {loading ? <div>Loading...</div> : view === 'categories' && !selectedCategory ? (
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div key={cat.category_id} className="category-card" onClick={() => onCategoryClick(cat.category_id, cat.name)}>
                            <h3>{cat.name}</h3>
                            <p>{cat.description}</p>
                        </div>
                    ))}
                    {!categories.length && <p>No categories found.</p>}
                </div>
            ) : (
                <>
                    {events.map((ev) => <EventCard key={ev.event_id} event={ev} onClick={() => navigate(`/events/${ev.event_id}`)} />)}
                    {!loading && events.length === 0 && categories.length === 0 && <p>No items found.</p>}
                </>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
    );
};

export default PaginatedEventView;
