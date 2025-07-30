import React, { useEffect, useState, useContext } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";
import "./DashboardStats.css";
import { AuthContext } from "../AuthContext"; // Assuming AuthContext is one level up

const DashboardStats = () => {
    const [stats, setStats] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [chartData, setData] = useState({
        labels: [],
        datasets: [
            {
                label: "Your Activity",
                data: [],
                backgroundColor: ["#ADD8E6", "#ADD8E6", "#ADD8E6", "#ADD8E6", "#ADD8E6"],
                borderColor: ["#007BFF", "#007BFF", "#007BFF", "#007BFF", "#007BFF"],
                borderWidth: 1,
                fill: true,
                tension: 0.3,
            },
        ],
    });

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    borderColor: '#eee',
                    borderDash: [2, 2],
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
        layout: { padding: 15 },
    };

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            let apiUrl = "http://localhost:5000/api/stats"; // Default for clients and freelancers

            if (user?.role === "admin") {
                apiUrl = "http://localhost:5000/api/admin/stats"; // You might need a specific admin stats route
            }

            try {
                const response = await axios.get(apiUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching stats:", err.response || err.message);
                setError("Error fetching stats.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.role]);

    // Dynamically set data and labels based on the fetched stats
useEffect(() => {
        if (stats) {
            let labels = [];
            let dataPoints = [];

            if (user?.role === "client") {
                labels = ["Projects Posted", "Bids Received", "In Progress"];
                dataPoints = [stats.projects || 0, stats.bidsReceived || 0, stats.inProgress || 0];
            } else if (user?.role === "freelancer") {
                labels = ["Bids Placed", "Working On", "Earnings"];
                dataPoints = [stats.bidsPlaced || 0, stats.projectsWorkingOn || 0, stats.earnings || 0];
            } else if (user?.role === "admin") {
                labels = ["Total Users", "Total Projects", "Total Bids"];
                dataPoints = [stats.totalUsers || 0, stats.totalProjects || 0, stats.totalBids || 0];
            }

            setData(prevState => ({ // Update based on previous state (optional but good practice)
                ...prevState,
                labels: labels,
                datasets: [{ ...prevState.datasets[0], data: dataPoints }],
            }));
        }
    }, [stats, user?.role]); // Removed chartData from the dependency array

    return (
        <div className="stats-wrapper">
            <h2>Dashboard Analytics</h2>
            {loading ? (
                <p className="loading-message">Loading stats...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : Object.keys(stats).length > 0 ? (
                <div className="chart-container">
                    <Bar data={chartData} options={options} />
                </div>
            ) : (
                <p className="no-data-message">No stats available.</p>
            )}
        </div>
    );
};

export default DashboardStats;