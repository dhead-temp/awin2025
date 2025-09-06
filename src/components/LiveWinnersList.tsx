import React, { useState, useEffect } from 'react';
import { Crown, Trophy } from 'lucide-react';

interface Winner {
  name: string;
  amount: number;
  id: number;
}

interface LiveWinnersListProps {
  title?: string;
  subtitle?: string;
  maxHeight?: boolean;
  className?: string;
}

// Pool of winner names and amounts
const winnerPool = [
  { name: 'Priya S.', amount: 1250 },
  { name: 'Rahul K.', amount: 890 },
  { name: 'Sneha M.', amount: 1500 },
  { name: 'Amit P.', amount: 750 },
  { name: 'Kavya R.', amount: 920 },
  { name: 'Anita D.', amount: 1100 },
  { name: 'Vikash T.', amount: 680 },
  { name: 'Meera J.', amount: 1350 },
  { name: 'Suresh B.', amount: 950 },
  { name: 'Pooja L.', amount: 1200 },
  { name: 'Arjun M.', amount: 800 },
  { name: 'Divya N.', amount: 1450 },
  { name: 'Kiran P.', amount: 720 },
  { name: 'Ravi S.', amount: 1050 },
  { name: 'Nisha G.', amount: 880 },
  { name: 'Deepak H.', amount: 1300 },
  { name: 'Sita R.', amount: 650 },
  { name: 'Manoj K.', amount: 1150 },
  { name: 'Rekha V.', amount: 990 },
  { name: 'Ajay C.', amount: 1400 },
  { name: 'Sunita F.', amount: 770 },
  { name: 'Rohit A.', amount: 1250 },
  { name: 'Geeta W.', amount: 850 },
  { name: 'Ashok Y.', amount: 1180 },
  { name: 'Lata Z.', amount: 930 },
  { name: 'Vinod Q.', amount: 1320 },
  { name: 'Shanti E.', amount: 700 },
  { name: 'Ramesh U.', amount: 1080 },
  { name: 'Kamala I.', amount: 820 },
  { name: 'Sunil O.', amount: 1220 },
  { name: 'Bharti X.', amount: 960 },
  { name: 'Mohan J.', amount: 1380 },
  { name: 'Sushma K.', amount: 740 },
  { name: 'Harish L.', amount: 1120 },
  { name: 'Radha M.', amount: 890 }
];

const LiveWinnersList: React.FC<LiveWinnersListProps> = ({ 
  title = "🔴 Live Winners",
  subtitle = "Winners updating every 2 seconds",
  maxHeight = true,
  className = ""
}) => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [nextId, setNextId] = useState(1);

  // Initialize with some winners
  useEffect(() => {
    const initialWinners = winnerPool.slice(0, 5).map((winner, index) => ({
      ...winner,
      id: index + 1
    }));
    setWinners(initialWinners);
    setNextId(6);
  }, []);

  // Add new winner every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomWinner = winnerPool[Math.floor(Math.random() * winnerPool.length)];
      
      setWinners(prevWinners => {
        const newWinner = {
          ...randomWinner,
          id: nextId
        };
        
        let updatedWinners = [newWinner, ...prevWinners];
        
        // Keep only 40 winners max
        if (updatedWinners.length > 40) {
          updatedWinners = updatedWinners.slice(0, 40);
        }
        
        return updatedWinners;
      });
      
      setNextId(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 text-xs sm:text-sm px-4">{subtitle}</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className={maxHeight ? "max-h-96 overflow-y-auto" : ""}>
          <div className="space-y-1 p-4">
            {winners.map((winner: Winner, index: number) => (
              <div 
                key={winner.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
                  index === 0 ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 animate-pulse' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-blue-600'
                  }`}>
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{winner.name}</h3>
                    {index === 0 && <span className="text-xs text-green-600 font-medium">Just Won!</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${index === 0 ? 'text-green-600 text-lg' : 'text-emerald-600'}`}>
                    ₹{winner.amount}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Show "1000+ Other winners" at the end */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">1000+ Other Winners</h3>
                  <span className="text-xs text-blue-600 font-medium">And counting...</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">₹50L+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWinnersList;
