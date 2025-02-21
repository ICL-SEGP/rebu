"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Bar, Pie, Line, PolarArea } from "react-chartjs-2"
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PolarAreaController,
} from "chart.js"

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale
)

// Helper: sum numeric fields in an array of objects
function sum(array, key) {
  return array.reduce((acc, cur) => acc + (cur[key] || 0), 0)
}

export default function SalesDashboard({ monthlyBreakdown }) {

  const sortedMonthlyData = [
    ["September", 3],
    ["October", 4],
    ["November", 4],
    ["December", 3],
    ["January", 4],
    ["February", 2],
  ]

  // 3) Extract labels & values
  const labels = sortedMonthlyData.map(([month]) => month)
  const values = sortedMonthlyData.map(([_, count]) => count)

  const data = {
    labels,
    datasets: [
      {
        label: "Users Per Month",
        data: values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.4)",
          "rgba(54, 162, 235, 0.4)",
          "rgba(255, 206, 86, 0.4)",
          "rgba(102, 187, 106, 0.4)",
          "rgba(239, 83, 80, 0.4)",
          "rgba(171, 71, 188, 0.4)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(102, 187, 106, 1)",
          "rgba(239, 83, 80, 1)",
          "rgba(171, 71, 188, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      r: {
        ticks: {
          display: true,
          stepSize: 1,
        },
        grid: {
          display: true,
        },
        pointLabels: {
          display: false,
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Token Distribution (Pie)",
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
  };


  const numericBreakdown = monthlyBreakdown.map((item) => ({
    ...item,
    // Ensure these fields are numbers
    rebateCompleted: parseFloat(item.rebateCompleted),
    tokensRefunded: parseFloat(item.tokensRefunded),
  }))

  // ----- BAR CHART (Orders by Month) -----
  const barData = {
    labels: numericBreakdown.map((d) => d.monthName), // x-axis
    datasets: [
      {
        label: "Completed Orders",
        data: numericBreakdown.map((d) => d.completedOrders),
        backgroundColor: "#66BB6A",
      },
      {
        label: "Refunded Orders",
        data: numericBreakdown.map((d) => d.refundedOrders),
        backgroundColor: "#EF5350",
      },
    ],
  }

  // ----- LINE CHART (Tokens Over Time) -----
  const lineData = {
    labels: numericBreakdown.map((d) => d.monthName),
    datasets: [
      {
        label: "Completed Rebate Tokens",
        data: numericBreakdown.map((d) => d.rebateCompleted),
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.2)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Refunded Tokens",
        data: numericBreakdown.map((d) => d.tokensRefunded),
        borderColor: "#AB47BC",
        backgroundColor: "rgba(171, 71, 188, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  }

  // ----- PIE CHART (Totals Summed) -----
  const totalCompletedTokens = sum(numericBreakdown, "rebateCompleted")
  const totalRefundedTokens = sum(numericBreakdown, "tokensRefunded")

  const pieData = {
    labels: ["Completed Tokens", "Refunded Tokens"],
    datasets: [
      {
        data: [totalCompletedTokens, totalRefundedTokens],
        backgroundColor: ["#42A5F5", "#AB47BC"],
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Dashboard</CardTitle>
        <CardDescription>
          A quick overview of monthly orders, rebates, and refunds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Top: Full-width line chart */}
        <div className="mb-8 w-full h-[500px] bg-white p-4 border rounded-md shadow">
          <h2 className="mb-4 text-xl font-semibold">Tokens Over Time (Full Width)</h2>
          <Line data={lineData} />
        </div>

        {/* Bottom: Two columns for Bar & Pie side by side */}
        <div
          style={{
            display: "flex",       // side-by-side
            flexWrap: "wrap",      // wrap on small screens
            gap: "1rem",           // spacing between charts
            justifyContent: "center" // center horizontally
          }}
        >


          <div
            style={{
              position: "relative",
              width: "300px",
              height: "300px",
              overflow: "hidden",
            }}
          >

            <PolarArea data={data} options={polarOptions} />
          </div>




          <div
            style={{
              width: "300px",
              height: "300px",
              overflow: "hidden",
            }}
          >
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}