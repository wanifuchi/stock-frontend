'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StockInfo as StockInfoType } from '@/lib/api';

interface StockInfoProps {
  stockInfo: StockInfoType;
}

export const StockInfo: React.FC<StockInfoProps> = ({ stockInfo }) => {
  const isPositive = stockInfo.change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeIcon = isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{stockInfo.symbol}</h2>
          <p className="text-gray-600">{stockInfo.name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{formatCurrency(stockInfo.current_price)}</p>
          <div className={`flex items-center justify-end gap-2 ${changeColor}`}>
            {changeIcon}
            <span className="font-semibold">
              {isPositive && '+'}
              {stockInfo.change.toFixed(2)} ({isPositive && '+'}
              {stockInfo.change_percent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm text-gray-600">出来高</p>
          <p className="text-lg font-semibold">{formatNumber(stockInfo.volume)}</p>
        </div>
        {stockInfo.market_cap && (
          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm text-gray-600">時価総額</p>
            <p className="text-lg font-semibold">
              {formatCurrency(stockInfo.market_cap / 1000000000)}B
            </p>
          </div>
        )}
      </div>
    </div>
  );
};