const TokenSummary = ({ available, locked }) => (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold">Token Summary</h2>
      <p>Total Available Tokens: {available}</p>
      <p>Locked Tokens: {locked}</p>
    </div>
  );
  
  export default TokenSummary;
  