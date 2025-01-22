const TokenSummary = ({ available, locked }) => (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-lg font-semibold text-center">Token Summary</h2>
      <div className="mt-4 text-center space-y-2">
        <p className="text-blue-600 text-xl">
          <span className="font-bold">Available Tokens:</span> {available}
        </p>
        <p className="text-red-600 text-xl">
          <span className="font-bold">Locked Tokens:</span> {locked}
        </p>
      </div>
    </div>
  );
  export default TokenSummary;
  