import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TokenSummary from "../components/TokenSummary";
import TransactionHistory from "../components/TransactionHistory";
import mockData from "../mockData"; // Import mock data

const HomePage = () => {
  const data = mockData; // Use mock data instead of fetching from API

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 grid gap-6 md:grid-cols-2">
        <TokenSummary available={data.tokens.available} locked={data.tokens.locked} />
        <TransactionHistory transactions={data.transactions} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
