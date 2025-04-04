
// import React, { useState } from 'react';
// import { mockCPEData } from '../utils/mockData';
// import './Table.css';

// const Table = () => {
//     // State management
//     const [data, setData] = useState(mockCPEData);
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(15);
//     const [filters, setFilters] = useState({
//         title: '',
//         uri22: '',
//         uri23: ''
//     });

//     // Format date helper
//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         return new Date(dateString).toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric',
//             year: 'numeric'
//         });
//     };

//     // Handle filter changes
//     const handleFilterChange = (field, value) => {
//         setFilters(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     // Filter data based on search terms
//     const filteredData = data.data.filter(item => {
//         const matchesTitle = item.cpe_title.toLowerCase().includes(filters.title.toLowerCase());
//         const matchesUri22 = item.cpe_22_uri.toLowerCase().includes(filters.uri22.toLowerCase());
//         const matchesUri23 = item.cpe_23_uri.toLowerCase().includes(filters.uri23.toLowerCase());
//         return matchesTitle && matchesUri22 && matchesUri23;
//     });

//     // Paginate data
//     const paginatedData = filteredData.slice(
//         (page - 1) * limit,
//         page * limit
//     );

//     return (
//         <div className="table-container">
//             {/* Filters */}
//             <div className="filters">
//                 <div className="filter-group">
//                     <label>Title:</label>
//                     <input
//                         type="text"
//                         value={filters.title}
//                         onChange={(e) => handleFilterChange('title', e.target.value)}
//                         placeholder="Search by title..."
//                     />
//                 </div>

//                 <div className="filter-group">
//                     <label>CPE URI 2.2:</label>
//                     <input
//                         type="text"
//                         value={filters.uri22}
//                         onChange={(e) => handleFilterChange('uri22', e.target.value)}
//                         placeholder="Search by URI 2.2..."
//                     />
//                 </div>

//                 <div className="filter-group">
//                     <label>CPE URI 2.3:</label>
//                     <input
//                         type="text"
//                         value={filters.uri23}
//                         onChange={(e) => handleFilterChange('uri23', e.target.value)}
//                         placeholder="Search by URI 2.3..."
//                     />
//                 </div>

//                 {/* Pagination controls */}
//                 <div className="pagination-controls">
//                     <select
//                         value={limit}
//                         onChange={(e) => setLimit(Number(e.target.value))}
//                     >
//                         {[5, 10, 15].map(size => (
//                             <option key={size} value={size}>{size} per page</option>
//                         ))}
//                     </select>

//                     <button onClick={() => setPage(p => Math.max(1, p - 1))}>
//                         Previous
//                     </button>
//                     <span>Page {page}</span>
//                     <button onClick={() => setPage(p => p + 1)}>
//                         Next
//                     </button>
//                 </div>
//             </div>

//             {/* Main table */}
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Title</th>
//                         <th>CPE URI 2.2</th>
//                         <th>CPE URI 2.3</th>
//                         <th>Deprecated Date 2.2</th>
//                         <th>Deprecated Date 2.3</th>
//                         <th>References</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {paginatedData.map((item) => (
//                         <tr key={item.id}>
//                             <td>{item.cpe_title}</td>
//                             <td>{item.cpe_22_uri}</td>
//                             <td>{item.cpe_23_uri}</td>
//                             <td>{formatDate(item.cpe_22_deprecation_date)}</td>
//                             <td>{formatDate(item.cpe_23_deprecation_date)}</td>
//                             <td>
//                                 {item.reference_links.slice(0, 2).map((link, index) => (
//                                     <div key={index} className="reference-link">
//                                         <a href={link} target="_blank" rel="noopener noreferrer">
//                                             {link.substring(0, 30)}...
//                                         </a>
//                                     </div>
//                                 ))}
//                                 {item.reference_links.length > 2 && (
//                                     <button>
//                                         ...more
//                                     </button>
//                                 )}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* Empty state */}
//             {paginatedData.length === 0 && (
//                 <div className="empty-state">
//                     No records found matching your criteria.
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Table;





import React, { useState } from 'react';
import axios from 'axios';

const Table = () => {
    // State management
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [filters, setFilters] = useState({
        title: '',
        uri22: '',
        uri23: ''
    });

    // API endpoints
    const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

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

            setData(response.data);
        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Effect hook to load data when dependencies change
    React.useEffect(() => {
        fetchData();
    }, [page, limit, filters]);

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Render loading state
    if (loading) {
        return (
            <div className="table-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    // Render error state
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

                {/* Pagination controls */}
                <div className="pagination-controls">
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        {[15, 25, 50].map(size => (
                            <option key={size} value={size}>{size} per page</option>
                        ))}
                    </select>

                    <button onClick={() => setPage(p => Math.max(1, p - 1))}>
                        Previous
                    </button>
                    <span>Page {page}</span>
                    <button onClick={() => setPage(p => p + 1)}>
                        Next
                    </button>
                </div>
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