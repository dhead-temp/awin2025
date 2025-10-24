import React, { memo } from "react";
import {
  History,
  TrendingUp,
  CreditCard,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { Transaction } from "../services/api";

interface TransactionsSectionProps {
  isLoading: boolean;
  filteredTx: Transaction[];
  showHistoryModal: boolean;
  setShowHistoryModal: (show: boolean) => void;
  transactions: Transaction[];
  trackUniqueViewedTransactionHistory: () => void;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  isLoading,
  filteredTx,
  showHistoryModal,
  setShowHistoryModal,
  transactions,
  trackUniqueViewedTransactionHistory,
}) => {
  return (
    <>
      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              Recent Transactions
            </h2>
          </div>
          <button
            onClick={() => {
              trackUniqueViewedTransactionHistory();
              setShowHistoryModal(true);
            }}
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
          >
            View All
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {isLoading ? (
            <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
              Loading transactions...
            </div>
          ) : filteredTx.length === 0 ? (
            <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
              No transactions yet
            </div>
          ) : (
            filteredTx.slice(0, 5).map((tx) => {
              const isCredit = tx.type === "credit";
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      isCredit ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    {isCredit ? (
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    ) : (
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {tx.note || "Transaction"}
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                          isCredit ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {typeof tx.amount === "string"
                          ? parseFloat(tx.amount).toFixed(2)
                          : tx.amount}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="text-xs text-gray-500">
                        {new Date(tx.created_on).toLocaleDateString()}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tx.note === "Withdrawal Request"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {tx.note === "Withdrawal Request"
                          ? "In Process"
                          : "Completed"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Transaction History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                All Transactions
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                    Loading transactions...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                    No transactions yet
                  </div>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <div
                        key={tx.id}
                        className="py-2 sm:py-3 flex items-center"
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 ${
                            isCredit ? "bg-emerald-50" : "bg-red-50"
                          }`}
                        >
                          {isCredit ? (
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                          ) : (
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                              {tx.note || "Transaction"}
                            </div>
                            <div
                              className={`text-xs sm:text-sm font-bold ${
                                isCredit
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {isCredit ? "+" : "-"}₹
                              {typeof tx.amount === "string"
                                ? parseFloat(tx.amount).toFixed(2)
                                : tx.amount}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-[10px] sm:text-[11px] text-gray-500">
                              {new Date(tx.created_on).toLocaleString()} •
                              TXN-{String(tx.id)}
                            </div>
                            <span
                              className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                                tx.note === "Withdrawal Request"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {tx.note === "Withdrawal Request"
                                ? "In Process"
                                : "Completed"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(TransactionsSection);
