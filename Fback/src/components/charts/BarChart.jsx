import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, title, color = '#00f2fe' }) => {
    // Handle empty data
    if (!data || Object.keys(data).length === 0 || Object.values(data).every(v => v === 0)) {
        return (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b4b4c5' }}>
                <p>No data available</p>
            </div>
        );
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
        labels,
        datasets: [
            {
                label: title || 'Count',
                data: values,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 35, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#b4b4c5',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#b4b4c5',
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
            },
            x: {
                ticks: {
                    color: '#b4b4c5',
                    font: {
                        size: 10,
                    },
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div style={{ height: '300px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;
