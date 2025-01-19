import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TokenSummary from "../components/TokenSummary";
import TransactionHistory from "../components/TransactionHistory";
import useFetch from "../hooks/useFetch";

const HomePage = () => {
  const { data, loading, error } = useFetch("http://localhost:5000/user-data");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <TokenSummary available={data.tokens.available} locked={data.tokens.locked} />
        <TransactionHistory transactions={data.transactions} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
