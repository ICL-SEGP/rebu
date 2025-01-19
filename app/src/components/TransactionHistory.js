const TransactionHistory = ({ transactions }) => (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-lg font-semibold">Transaction History</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index} className="border-b p-2">
            {tx.date}: {tx.item} - {tx.price} tokens
          </li>
        ))}
      </ul>
    </div>
  );
  
  export default TransactionHistory;
  