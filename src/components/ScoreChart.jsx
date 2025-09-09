import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const ScoreChart = ({ score, compact = false }) => {
  if (score === null) {
    return (
      <div className="score-chart no-score">
        <span>No score</span>
      </div>
    )
  }

  const data = {
    labels: ['Quality Score', 'Remaining'],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [
          getScoreColor(score),
          '#f0f0f0',
        ],
        borderWidth: 0,
        cutout: compact ? '60%' : '70%',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !compact,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  }

  return (
    <div className={`score-chart ${compact ? 'compact' : ''}`}>
      <Doughnut data={data} options={options} />
      {!compact && (
        <div className="score-value">
          {score}
        </div>
      )}
    </div>
  )
}

// Helper function to determine color based on score
function getScoreColor(score) {
  if (score >= 80) return '#4CAF50' // Green
  if (score >= 60) return '#FFC107' // Amber
  return '#F44336' // Red
}

export default ScoreChart