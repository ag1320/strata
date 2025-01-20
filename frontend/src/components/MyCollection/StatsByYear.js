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
import "../../styling/StatsByYear.css";

// Register necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatsByYear = ({ uniqueSessions }) => {
  // Aggregate the total number of plays per year
  const playsByYear = uniqueSessions.reduce((acc, session) => {
    const year = new Date(session.date).getFullYear(); // Extract the year
    acc[year] = (acc[year] || 0) + 1; // Increment play count for the year
    return acc;
  }, {});

  // Prepare the data for the bar chart
  const chartData = {
    labels: Object.keys(playsByYear).sort(), // Sort years
    datasets: [
      {
        label: "Plays Per Year",
        data: Object.values(playsByYear), // Total plays per year
        backgroundColor: "rgba(47, 72, 88, 1)", // Bar color
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
      <Typography className="stats-title">Total Plays Per Year</Typography>
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default StatsByYear;
