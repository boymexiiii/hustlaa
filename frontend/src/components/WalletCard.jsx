import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight } from 'lucide-react';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';

const WalletCard = ({ onOpenTopup, onOpenWithdraw }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.getBalance();
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!wallet) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-primary-100">Wallet Balance</p>
            <h3 className="text-3xl font-bold">₦{parseFloat(wallet.balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <p className="text-xs text-primary-100">Total Earned</p>
          </div>
          <p className="text-lg font-semibold">₦{parseFloat(wallet.total_earned).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-300" />
            <p className="text-xs text-primary-100">Total Spent</p>
          </div>
          <p className="text-lg font-semibold">₦{parseFloat(wallet.total_spent).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onOpenTopup}
          className="flex-1 bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Funds
        </button>
        <button
          onClick={onOpenWithdraw}
          className="flex-1 bg-primary-800 hover:bg-primary-900 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
