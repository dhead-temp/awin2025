import React from 'react';
import LiveWinnersList from './LiveWinnersList';

const WinnersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Winners List</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Congratulations to all our winners! See who's earning money with Answer & Win
          </p>
        </div>


        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">₹50,00,000+</div>
            <div className="text-emerald-100">Total Winnings This Month</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">1,00,000+</div>
            <div className="text-blue-100">Happy Winners</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white text-center">
            <div className="text-2xl font-bold mb-2">₹2,850</div>
            <div className="text-purple-100">Highest Single Win</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnersPage;