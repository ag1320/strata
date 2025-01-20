import { Bar } from "react-chartjs-2";
import { Card, Typography } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styling/StatsBySeason.css";

// Register necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Function to determine the season based on the month
const getSeason = (month) => {
  if (month === 11 || month <= 1) return "Winter";
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  return "Fall";
};

const StatsBySeason = ({ uniqueSessions }) => {
  // Aggregate the total number of plays per season
  const playsBySeason = uniqueSessions.reduce((acc, session) => {
    const month = new Date(session.date).getMonth(); // Get month (0-11)
    const season = getSeason(month);
    acc[season] = (acc[season] || 0) + 1; // Increment play count for the season
    return acc;
  }, {});

  // Prepare the data for the bar chart
  const chartData = {
    labels: ["Winter", "Spring", "Summer", "Fall"], // Seasons
    datasets: [
      {
        label: "Plays Per Season",
        data: [
          playsBySeason["Winter"] || 0,
          playsBySeason["Spring"] || 0,
          playsBySeason["Summer"] || 0,
          playsBySeason["Fall"] || 0,
        ],
        backgroundColor: "rgba(187, 167, 105, 1)", // Bar color
        borderColor: "rgba(255, 255, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "white",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
        },
      },
    },
  };

  return (
    <Card className="stats-card">
      <Typography className="stats-title">Total Plays Per Season</Typography>
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default StatsBySeason;
