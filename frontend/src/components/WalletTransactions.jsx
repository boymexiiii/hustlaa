import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Send, Download, RotateCcw } from 'lucide-react';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';

const WalletTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await walletAPI.getTransactions(params);
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'earning':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'refund':
        return <RotateCcw className="w-5 h-5 text-blue-500" />;
      default:
        return <Send className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'earning':
        return 'text-green-600';
      case 'withdrawal':
      case 'payment':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
        <div className="flex gap-2">
          {['all', 'deposit', 'withdrawal', 'payment', 'earning'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                  <p className="text-sm text-gray-600">{tx.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(tx.created_at).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getTransactionColor(tx.type)}`}>
                  {tx.type === 'deposit' || tx.type === 'earning' ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusBadge(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletTransactions;
