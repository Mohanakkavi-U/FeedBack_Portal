import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentChart = ({ data }) => {
    // Handle empty data
    if (!data || (data.positive === 0 && data.neutral === 0 && data.negative === 0)) {
        return (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b4b4c5' }}>
                <p>No sentiment data available</p>
            </div>
        );
    }

    const chartData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
            {
                data: [
                    data.positive || 0,
                    data.neutral || 0,
                    data.negative || 0,
                ],
                backgroundColor: [
                    'rgba(0, 242, 254, 0.8)',
                    'rgba(180, 180, 197, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                ],
                borderColor: [
                    '#00f2fe',
                    '#b4b4c5',
                    '#f5576c',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#b4b4c5',
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 600,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 35, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#b4b4c5',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
            },
        },
    };

    return (
        <div style={{ height: '300px' }}>
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default SentimentChart;
