"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartParams {
  symbol: string;
  color: string;
  chartData: {
    epochId: number;
    price: number;
  }[];
}

export default function Chart({ symbol, color, chartData }: ChartParams) {
  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Epoch",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        intersect: false,
      },
    },
  };

  const values = chartData
    .filter((item) => item !== null)
    .map((item) => item.price);

  const labels = chartData
    .filter((item) => item !== null)
    .map((item) => item.epochId);

  const data = {
    labels,
    datasets: [
      {
        label: symbol,
        data: values,
        borderColor: color,
        backgroundColor: hexToRGBA(color, 0.6),
      },
    ],
  };

  function hexToRGBA(hex: string, alpha: number): string {
    const r: number = parseInt(hex.slice(1, 3), 16);
    const g: number = parseInt(hex.slice(3, 5), 16);
    const b: number = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return <>{options && values && <Line options={options} data={data} />}</>;
}
