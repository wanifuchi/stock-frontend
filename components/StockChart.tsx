'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StockPriceHistory } from '@/lib/api';
import { format } from 'date-fns';

interface StockChartProps {
  priceHistory: StockPriceHistory;
}

export const StockChart: React.FC<StockChartProps> = ({ priceHistory }) => {
  // データを recharts 用に変換
  const chartData = priceHistory.dates.map((date, index) => ({
    date,
    price: priceHistory.prices[index],
    volume: priceHistory.volumes[index],
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd');
  };

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; payload?: { volume: number } }>; label?: string }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{format(new Date(label), 'yyyy/MM/dd')}</p>
          <p className="text-blue-600">価格: {formatPrice(payload[0].value)}</p>
          <p className="text-gray-600">出来高: {formatVolume(payload[0].payload?.volume || 0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">価格チャート</h3>
      
      {chartData.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#888"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatPrice}
                stroke="#888"
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="株価"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">チャートデータがありません</p>
        </div>
      )}
    </div>
  );
};