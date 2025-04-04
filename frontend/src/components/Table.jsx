import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Table.css';

const Table = () => {
    // State management
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState({
        title: '',
        uri22: '',
        uri23: ''
    });
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // API endpoints
    const API_BASE_URL = 'http://localhost:5000/api';

   

    // Fetch data with pagination and filters
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/cpes`, {
                params: {
                    page,
                    limit,
                    ...filters
                }
            });
            
            setData(response.data.data);
            setTotalItems(response.data.total);
            setCurrentPage(response.data.page);
            setLastPage(Math.ceil(response.data.total / limit));
        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            console.error('API Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, limit]);

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle search submission
    const handleSearchSubmit = () => {
        setPage(1); // Reset pagination when searching
        fetchData();
    };

    // Pagination handlers
    const handlePreviousPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(lastPage, prev + 1));

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle link display
    const showAllLinks = (links) => {
        alert('Additional links:\n' + links.join('\n'));
    };

    // Loading state
    if (loading) {
        return (
            <div className="table-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="table-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="table-container">
            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        value={filters.title}
                        onChange={(e) => handleFilterChange('title', e.target.value)}
                        placeholder="Search by title..."
                    />
                </div>
                <div className="filter-group">
                    <label>CPE URI 2.2:</label>
                    <input
                        type="text"
                        value={filters.uri22}
                        onChange={(e) => handleFilterChange('uri22', e.target.value)}
                        placeholder="Search by URI 2.2..."
                    />
                </div>
                <div className="filter-group">
                    <label>CPE URI 2.3:</label>
                    <input
                        type="text"
                        value={filters.uri23}
                        onChange={(e) => handleFilterChange('uri23', e.target.value)}
                        placeholder="Search by URI 2.3..."
                    />
                </div>
                {/* Search Button */}
                <button onClick={handleSearchSubmit}>Search</button>
            </div>

            {/* Pagination controls */}
            <div className="pagination-controls">
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(size => (
                        <option key={size} value={size}>{size} per page</option>
                    ))}
                </select>
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {lastPage}</span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === lastPage}
                >
                    Next
                </button>
                <span className="total-items">
                    Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalItems)}
                    of {totalItems} items
                </span>
            </div>

            {/* Main table */}
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>CPE URI 2.2</th>
                        <th>CPE URI 2.3</th>
                        <th>Deprecated Date 2.2</th>
                        <th>Deprecated Date 2.3</th>
                        <th>References</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.cpe_title}</td>
                            <td>{item.cpe_22_uri}</td>
                            <td>{item.cpe_23_uri}</td>
                            <td>{formatDate(item.cpe_22_deprecation_date)}</td>
                            <td>{formatDate(item.cpe_23_deprecation_date)}</td>
                            <td>
                                {item.reference_links.slice(0, 2).map((link, index) => (
                                    <div key={index} className="reference-link">
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            {link.substring(0, 30)}...
                                        </a>
                                    </div>
                                ))}
                                {item.reference_links.length > 2 && (
                                    <button onClick={() => showAllLinks(item.reference_links)}>
                                        ...more
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Empty state */}
            {data.length === 0 && (
                <div className="empty-state">
                    No records found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default Table;