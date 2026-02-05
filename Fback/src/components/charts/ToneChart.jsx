import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getToneColor } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

const ToneChart = ({ data }) => {
    // If no data, show empty state
    if (!data || Object.keys(data).length === 0 || Object.values(data).every(v => v === 0)) {
        return (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b4b4c5' }}>
                <p>No tone data available</p>
            </div>
        );
    }

    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                data: Object.values(data),
                backgroundColor: Object.keys(data).map(tone => getToneColor(tone)),
                borderColor: 'rgba(15, 15, 35, 0.5)',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#b4b4c5',
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 11
                    }
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 35, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#b4b4c5',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
            }
        },
        cutout: '70%',
    };

    return (
        <div style={{ height: '220px', position: 'relative' }}>
            <Doughnut data={chartData} options={options} />
            <div className="chart-center-text">
                <span className="chart-total">{Object.values(data).reduce((a, b) => a + b, 0)}</span>
                <span className="chart-label">Total</span>
            </div>
        </div>
    );
};

export default ToneChart;
