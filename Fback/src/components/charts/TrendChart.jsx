import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TrendChart = ({ data }) => {
    // Handle empty data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b4b4c5' }}>
                <p>No trend data available</p>
            </div>
        );
    }

    const labels = data.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Positive',
                data: data.map((d) => d.positive),
                borderColor: '#00f2fe',
                backgroundColor: 'rgba(0, 242, 254, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Neutral',
                data: data.map((d) => d.neutral),
                borderColor: '#b4b4c5',
                backgroundColor: 'rgba(180, 180, 197, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Negative',
                data: data.map((d) => d.negative),
                borderColor: '#f5576c',
                backgroundColor: 'rgba(245, 87, 108, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#b4b4c5',
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 600,
                    },
                    usePointStyle: true,
                },
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
            <Line data={chartData} options={options} />
        </div>
    );
};

export default TrendChart;
