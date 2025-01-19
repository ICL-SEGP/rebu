const TransactionHistory = ({ transactions }) => (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-lg font-semibold text-center">Transaction History</h2>
      <ul className="mt-4">
        {transactions.map((tx, index) => (
          <li
            key={index}
            className="border-b p-2 flex justify-between hover:bg-gray-100 transition-colors duration-200"
          >
            <span>{tx.date}</span>
            <span>{tx.item}</span>
            <span className="font-bold">{tx.price} tokens</span>
          </li>
        ))}
      </ul>
    </div>
  );
  export default TransactionHistory;
  