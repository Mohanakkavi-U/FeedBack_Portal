import React from 'react';
import './KeywordCloud.css';

const KeywordCloud = ({ keywords }) => {
    if (!keywords || keywords.length === 0) {
        return (
            <div className="keyword-cloud-empty">
                <p className="text-muted">No keywords available</p>
            </div>
        );
    }

    // Calculate font sizes based on frequency
    const maxCount = Math.max(...keywords.map((kw) => kw.count));
    const minCount = Math.min(...keywords.map((kw) => kw.count));

    const getFontSize = (count) => {
        if (maxCount === minCount) return 1.2;
        const normalized = (count - minCount) / (maxCount - minCount);
        return 0.8 + normalized * 1.5; // Range from 0.8rem to 2.3rem
    };

    const getColor = (count) => {
        const normalized = (count - minCount) / (maxCount - minCount);
        if (normalized > 0.7) return '#667eea';
        if (normalized > 0.4) return '#8b9df8';
        return '#b4b4c5';
    };

    return (
        <div className="keyword-cloud">
            {keywords.map((kw, idx) => (
                <span
                    key={idx}
                    className="keyword-item"
                    style={{
                        fontSize: `${getFontSize(kw.count)}rem`,
                        color: getColor(kw.count),
                    }}
                    title={`${kw.word}: ${kw.count} occurrences`}
                >
                    {kw.word}
                </span>
            ))}
        </div>
    );
};

export default KeywordCloud;
