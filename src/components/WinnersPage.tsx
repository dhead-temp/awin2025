import React from 'react';
import { Crown, Trophy, Star, MapPin, Calendar } from 'lucide-react';

const WinnersPage: React.FC = () => {
  const topWinners = [
    { name: 'Priya Sharma', amount: 2850, location: 'Mumbai', date: '2025-01-15', rank: 1 },
    { name: 'Rahul Kumar', amount: 2650, location: 'Delhi', date: '2025-01-14', rank: 2 },
    { name: 'Sneha Patel', amount: 2400, location: 'Bangalore', date: '2025-01-13', rank: 3 }
  ];

  const recentWinners = [
    { name: 'Amit Singh', amount: 1250, location: 'Pune', date: '2025-01-15' },
    { name: 'Kavya Reddy', amount: 1180, location: 'Chennai', date: '2025-01-15' },
    { name: 'Rohit Gupta', amount: 1050, location: 'Hyderabad', date: '2025-01-14' },
    { name: 'Pooja Jain', amount: 980, location: 'Kolkata', date: '2025-01-14' },
    { name: 'Vikash Yadav', amount: 920, location: 'Lucknow', date: '2025-01-13' },
    { name: 'Anita Desai', amount: 890, location: 'Ahmedabad', date: '2025-01-13' },
    { name: 'Suresh Nair', amount: 850, location: 'Kochi', date: '2025-01-12' },
    { name: 'Meera Agarwal', amount: 820, location: 'Jaipur', date: '2025-01-12' },
    { name: 'Deepak Verma', amount: 780, location: 'Indore', date: '2025-01-11' },
    { name: 'Ritu Malhotra', amount: 750, location: 'Chandigarh', date: '2025-01-11' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Trophy className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Star className="h-8 w-8 text-orange-500" />;
      default:
        return <Trophy className="h-8 w-8 text-blue-500" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

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

        {/* Top Winners */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">🏆 Top Winners This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topWinners.map((winner, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-2xl p-4 text-center transform hover:scale-105 transition-all">
                <div className={`w-16 h-16 bg-gradient-to-r ${getRankBg(winner.rank)} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                  <div className="scale-75">{getRankIcon(winner.rank)}</div>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{winner.name}</div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">₹{winner.amount}</div>
                <div className="flex items-center justify-center text-gray-500 text-sm mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {winner.location}
                </div>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {winner.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Winners */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">🎉 Recent Winners</h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-3">
              <div className="grid grid-cols-4 gap-4 text-white font-semibold text-sm">
                <div>Winner</div>
                <div className="text-center">Amount</div>
                <div className="text-center">Location</div>
                <div className="text-center">Date</div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentWinners.map((winner, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mr-2">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{winner.name}</span>
                  </div>
                  <div className="text-center font-bold text-emerald-600 text-sm">₹{winner.amount}</div>
                  <div className="text-center text-gray-600 text-sm">{winner.location}</div>
                  <div className="text-center text-gray-500 text-sm">{winner.date}</div>
                </div>
              ))}
            </div>
          </div>
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