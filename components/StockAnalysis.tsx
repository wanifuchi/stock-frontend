'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { StockAnalysis as StockAnalysisType } from '@/lib/api';

interface StockAnalysisProps {
  analysis: StockAnalysisType;
}

export const StockAnalysis: React.FC<StockAnalysisProps> = ({ analysis }) => {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return <TrendingUp size={24} />;
      case 'SELL':
        return <TrendingDown size={24} />;
      case 'HOLD':
        return <AlertCircle size={24} />;
      default:
        return <AlertCircle size={24} />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return '買い推奨';
      case 'SELL':
        return '売り推奨';
      case 'HOLD':
        return '保有推奨';
      default:
        return 'エラー';
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">AI投資アドバイス</h3>
        <p className="text-sm text-gray-500">更新: {formatDate(analysis.timestamp)}</p>
      </div>

      {/* 推奨アクション */}
      <div className="mb-6">
        <div
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg border-2 ${getRecommendationColor(
            analysis.analysis.recommendation
          )}`}
        >
          {getRecommendationIcon(analysis.analysis.recommendation)}
          <span className="text-lg font-bold">
            {getRecommendationText(analysis.analysis.recommendation)}
          </span>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            信頼度: <span className="font-semibold">{(analysis.analysis.confidence * 100).toFixed(0)}%</span>
          </p>
        </div>
      </div>

      {/* 価格目標 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">目標価格</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(analysis.analysis.target_price)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">損切りライン</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(analysis.analysis.stop_loss)}
          </p>
        </div>
      </div>

      {/* 分析理由 */}
      <div>
        <h4 className="font-semibold mb-3">分析理由</h4>
        <ul className="space-y-2">
          {analysis.analysis.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};