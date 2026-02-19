import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX, FiAlertCircle } from 'react-icons/fi';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import { fetchRestaurants } from '../../utils/api';
import './Search.css';

const popularSearches = [
    'Pizza', 'Burger', 'Biryani', 'Chinese', 'South Indian',
    'Ice Cream', 'Pasta', 'Sandwich', 'Coffee', 'Cake',
    'Chicken', 'Dosa', 'Rolls', 'Salad'
];

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) { setQuery(q); performSearch(q); }
    }, [searchParams]);

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setSearched(true);
        setError(null);
        try {
            const res = await fetchRestaurants({ search: searchQuery });
            if (res.success) setResults(res.data);
        } catch (err) {
            console.error('Search failed:', err);
            setError(err.message || 'Search failed. Please try again.');
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query });
            performSearch(query);
        }
    };

    const handlePopularClick = (term) => {
        setQuery(term);
        setSearchParams({ q: term });
        performSearch(term);
    };

    return (
        <div className="search-page">
            <div className="search-page__container">
                <form className="search-page__form" onSubmit={handleSearch}>
                    <FiSearch className="search-page__icon" />
                    <input type="text" placeholder="Search for restaurants and food"
                        value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                    {query && <FiX className="search-page__clear" onClick={() => { setQuery(''); setResults([]); setSearched(false); setError(null); }} />}
                </form>

                {!searched && (
                    <div className="search-page__popular">
                        <h3>Popular Cuisines</h3>
                        <div className="search-page__popular-grid">
                            {popularSearches.map(term => (
                                <button key={term} className="search-page__popular-item" onClick={() => handlePopularClick(term)}>
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="search-page__error">
                        <FiAlertCircle size={24} />
                        <p>{error}</p>
                        <button onClick={() => performSearch(query)}>Try Again</button>
                    </div>
                )}

                {loading && (
                    <div className="search-page__loading">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="search-page__skeleton shimmer" />
                        ))}
                    </div>
                )}

                {searched && !loading && !error && (
                    <div className="search-page__results">
                        <h3>{results.length} restaurant{results.length !== 1 ? 's' : ''} found {query && `for "${query}"`}</h3>
                        <div className="search-page__results-grid">
                            {results.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                        </div>
                        {results.length === 0 && (
                            <div className="search-page__no-results">
                                <p>No results found for "{query}"</p>
                                <span>Try searching for a different restaurant or cuisine</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
