'use client';

import React from 'react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '@/lib/api';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicatorsType;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ indicators }) => {
  const getRSIColor = (rsi: number | undefined) => {
    if (!rsi) return 'text-gray-500';
    if (rsi > 70) return 'text-red-600';
    if (rsi < 30) return 'text-green-600';
    return 'text-gray-700';
  };

  const getRSILabel = (rsi: number | undefined) => {
    if (!rsi) return 'データなし';
    if (rsi > 70) return '買われすぎ';
    if (rsi < 30) return '売られすぎ';
    return '中立';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">テクニカル指標</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RSI */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">RSI (14日)</h4>
          {indicators.rsi !== null && indicators.rsi !== undefined ? (
            <div>
              <p className={`text-2xl font-bold ${getRSIColor(indicators.rsi)}`}>
                {indicators.rsi.toFixed(2)}
              </p>
              <p className={`text-sm ${getRSIColor(indicators.rsi)}`}>
                {getRSILabel(indicators.rsi)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">データなし</p>
          )}
        </div>

        {/* MACD */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">MACD</h4>
          {indicators.macd ? (
            <div className="text-sm space-y-1">
              <p>MACD: <span className="font-semibold">{indicators.macd.macd?.toFixed(2) || 'N/A'}</span></p>
              <p>シグナル: <span className="font-semibold">{indicators.macd.signal?.toFixed(2) || 'N/A'}</span></p>
              <p>ヒストグラム: <span className="font-semibold">{indicators.macd.histogram?.toFixed(2) || 'N/A'}</span></p>
            </div>
          ) : (
            <p className="text-gray-500">データなし</p>
          )}
        </div>

        {/* ボリンジャーバンド */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">ボリンジャーバンド</h4>
          {indicators.bollinger_bands ? (
            <div className="text-sm space-y-1">
              <p>上部: <span className="font-semibold">${indicators.bollinger_bands.upper?.toFixed(2) || 'N/A'}</span></p>
              <p>中央: <span className="font-semibold">${indicators.bollinger_bands.middle?.toFixed(2) || 'N/A'}</span></p>
              <p>下部: <span className="font-semibold">${indicators.bollinger_bands.lower?.toFixed(2) || 'N/A'}</span></p>
            </div>
          ) : (
            <p className="text-gray-500">データなし</p>
          )}
        </div>

        {/* 移動平均線 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">移動平均線</h4>
          {indicators.moving_averages ? (
            <div className="text-sm space-y-1">
              <p>SMA 20: <span className="font-semibold">${indicators.moving_averages.sma_20?.toFixed(2) || 'N/A'}</span></p>
              <p>SMA 50: <span className="font-semibold">${indicators.moving_averages.sma_50?.toFixed(2) || 'N/A'}</span></p>
              <p>SMA 200: <span className="font-semibold">${indicators.moving_averages.sma_200?.toFixed(2) || 'N/A'}</span></p>
            </div>
          ) : (
            <p className="text-gray-500">データなし</p>
          )}
        </div>
      </div>
    </div>
  );
};