import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const PaymentProofsFooter: React.FC = () => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(() => {
    // Initialize from localStorage, default to true if not set
    const saved = localStorage.getItem('paymentProofsExpanded');
    return saved !== null ? saved === 'true' : true;
  });
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  const paymentProofs = [
    { name: 'Tannu', city: 'Chennai', amount: '545', bank: 'sbi' },
    { name: 'Priya Sharma', city: 'Mumbai', amount: '1,250', bank: 'hdfc' },
    { name: 'Rajesh Kumar', city: 'Delhi', amount: '850', bank: 'icici' },
    { name: 'Anita Mehta', city: 'Bangalore', amount: '1,500', bank: 'axis' },
    { name: 'Vikram Patel', city: 'Ahmedabad', amount: '350', bank: 'sbi' },
    { name: 'Sunita Reddy', city: 'Hyderabad', amount: '1,100', bank: 'hdfc' },
    { name: 'Mohit Agarwal', city: 'Kolkata', amount: '750', bank: 'icici' },
    { name: 'Kavya Singh', city: 'Pune', amount: '1,300', bank: 'axis' }
  ];

  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('paymentProofsExpanded', isFooterExpanded.toString());
  }, [isFooterExpanded]);

  // Handle click outside to collapse footer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        if (isFooterExpanded) {
          setIsFooterExpanded(false);
        }
      }
    };

    if (isFooterExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFooterExpanded]);

  useEffect(() => {
    if (!isFooterExpanded) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentPaymentIndex((prev) => (prev + 1) % paymentProofs.length);
          setIsAnimating(false);
        }, 250);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isFooterExpanded, paymentProofs.length]);

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Sticky Footer with Payment Proofs */}
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl z-50 border-t border-gray-200/50">
        <div className="px-2 py-4">
          {isFooterExpanded ? (
            <div>
              <div className="relative">
                {/* Collapse Button - Positioned above and overlapping */}
                <button
                  onClick={() => setIsFooterExpanded(false)}
                  className="absolute -top-14 right-0 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-gray-300/50 z-10 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Collapse</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">₹</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-sm">Payment Proofs</h3>
                  </div>
                </div>
               
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-4 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/sbi.png" alt="SBI" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Tannu</div>
                          <div className="text-xs text-gray-500">Chennai</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹545</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123456</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/hdfc.png" alt="HDFC" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Priya Sharma</div>
                          <div className="text-xs text-gray-500">Mumbai</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹1,250</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123457</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/icici.png" alt="ICICI" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Rajesh Kumar</div>
                          <div className="text-xs text-gray-500">Delhi</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹850</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123458</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/axis.png" alt="Axis" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Anita Mehta</div>
                          <div className="text-xs text-gray-500">Bangalore</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹1,500</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123459</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/sbi.png" alt="SBI" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Vikram Patel</div>
                          <div className="text-xs text-gray-500">Ahmedabad</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹350</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123460</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/hdfc.png" alt="HDFC" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Sunita Reddy</div>
                          <div className="text-xs text-gray-500">Hyderabad</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹1,100</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123461</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/icici.png" alt="ICICI" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Mohit Agarwal</div>
                          <div className="text-xs text-gray-500">Kolkata</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹750</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123462</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl p-5 w-[85%] border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <img src="img/axis.png" alt="Axis" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Kavya Singh</div>
                          <div className="text-xs text-gray-500">Pune</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">₹1,300</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">TXN: UPI7890123463</div>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-green-700 font-medium">Payment Successful</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs text-green-600 font-medium">Verified</span>
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 w-[85%] border border-emerald-300 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="text-white">
                        <div className="text-2xl font-bold text-emerald-100">2,500+</div>
                        <div className="text-sm opacity-90 font-medium">Payments this month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Expand Button - Positioned above and overlapping */}
              <button
                onClick={() => setIsFooterExpanded(true)}
                className="absolute -top-14 right-0 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-gray-300/50 z-10 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Expand</span>
                <ChevronUp className="w-4 h-4" />
              </button>
              
              {/* Main Container */}
              <div className="cursor-pointer" onClick={() => setIsFooterExpanded(true)}>
                <div className="flex items-center space-x-4">
                  {/* Circular Icon Placeholder */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out transform ${isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'} shadow-lg`}>
                    <img 
                      src={`/img/${paymentProofs[currentPaymentIndex].bank}.png`} 
                      alt={paymentProofs[currentPaymentIndex].bank.toUpperCase()} 
                      className="w-full h-full object-contain transition-all duration-500 ease-in-out" 
                      key={currentPaymentIndex}
                    />
                  </div>
                  
                  {/* Text with Decorative Underlines */}
                  <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="text-gray-700 font-semibold text-lg">
                      {paymentProofs[currentPaymentIndex].name} Got <span className="text-emerald-600 font-bold">{paymentProofs[currentPaymentIndex].amount}</span> Rs
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      {paymentProofs[currentPaymentIndex].city} 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentProofsFooter;
