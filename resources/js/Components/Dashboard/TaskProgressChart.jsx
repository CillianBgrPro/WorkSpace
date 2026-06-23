import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskProgressChart({ completed, remaining }) {
  const data = {
    labels: ['Terminées', 'Restantes'],
    datasets: [
      {
        data: [completed, remaining],
        backgroundColor: ['#4f46e5', '#e5e7eb'],
        hoverBackgroundColor: ['#4338ca', '#d1d5db'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { display: false } },
  };

  return (
    <div className="w-full h-48">
      <Doughnut data={data} options={options} />
    </div>
  );
}
