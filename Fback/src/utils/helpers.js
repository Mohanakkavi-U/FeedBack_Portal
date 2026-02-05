/**
 * Helper utility functions
 */

// Format date to readable string
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
};

// Get sentiment color
export const getSentimentColor = (sentiment) => {
    const colors = {
        positive: '#00f2fe',
        neutral: '#b4b4c5',
        negative: '#f5576c',
    };
    return colors[sentiment] || colors.neutral;
};

// Get priority color
export const getPriorityColor = (priority) => {
    const colors = {
        'Critical': '#f5576c', // Legacy support
        'High Impact': '#f5576c',
        'High': '#fa709a', // Legacy support
        'Medium Impact': '#fa709a',
        'Medium': '#fee140', // Legacy support
        'Low Impact': '#00f2fe',
        'Low': '#00f2fe', // Legacy support
    };
    return colors[priority] || colors['Low Impact'];
};

// Get tone color
export const getToneColor = (tone) => {
    const colors = {
        'Constructive': '#fee140', // Yellow
        'Appreciative': '#00f2fe', // Cyan
        'Critical': '#f5576c',     // Red
        'Inquisitive': '#667eea',  // Blue/Purple
        'Neutral': '#b4b4c5'       // Grey
    };
    return colors[tone] || colors.Neutral;
};

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        New: '#667eea',
        'In Progress': '#fee140',
        Resolved: '#00f2fe',
        Closed: '#6b6b7e',
    };
    return colors[status] || colors.New;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
};

// Service type options
export const serviceTypes = [
    'Electronics',
    'Cosmetics',
    'Groceries',
    'Fashion & Clothing',
    'Furniture',
    'Software Products',
    'Other',
];

// Status options
export const statuses = ['New', 'In Progress', 'Resolved', 'Closed'];

// Priority options
export const priorities = ['High Impact', 'Medium Impact', 'Low Impact'];

// Tone options
export const tones = ['Constructive', 'Appreciative', 'Critical', 'Inquisitive', 'Neutral'];

// Export CSV
export const exportToCSV = (data, filename = 'feedback.csv') => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map((row) =>
            headers.map((header) => {
                const value = row[header];
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
