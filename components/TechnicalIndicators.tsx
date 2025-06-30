'use client';

import React from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, LineChart } from 'lucide-react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicatorsType;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ indicators }) => {
  const getRSIStatus = (rsi: number | undefined) => {
    if (!rsi) return { color: 'text-gray-500', bg: 'bg-gray-50', label: 'データなし', signal: 'neutral' };
    if (rsi > 70) return { color: 'text-red-600', bg: 'bg-red-50', label: '買われすぎ', signal: 'sell' };
    if (rsi < 30) return { color: 'text-green-600', bg: 'bg-green-50', label: '売られすぎ', signal: 'buy' };
    return { color: 'text-gray-700', bg: 'bg-gray-50', label: '中立', signal: 'neutral' };
  };

  const getMACDStatus = (macd: { macd?: number; signal?: number; histogram?: number } | null | undefined) => {
    if (!macd || !macd.macd || !macd.signal) return { label: 'データなし', signal: 'neutral' };
    if (macd.macd > macd.signal) return { label: '買いシグナル', signal: 'buy' };
    return { label: '売りシグナル', signal: 'sell' };
  };

  const getBBStatus = (bollinger: { upper?: number; middle?: number; lower?: number } | null | undefined, currentPrice?: number) => {
    if (!bollinger || !bollinger.upper || !bollinger.lower) return { label: 'データなし', signal: 'neutral' };
    if (currentPrice) {
      if (currentPrice > bollinger.upper) return { label: '上限突破', signal: 'sell' };
      if (currentPrice < bollinger.lower) return { label: '下限接触', signal: 'buy' };
    }
    return { label: '正常範囲', signal: 'neutral' };
  };

  const rsiStatus = getRSIStatus(indicators.rsi);
  const macdStatus = getMACDStatus(indicators.macd);
  const bbStatus = getBBStatus(indicators.bollinger_bands);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'border-green-200 bg-green-50';
      case 'sell': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">テクニカル分析</h3>
        </div>

        <div className="space-y-4">
          {/* RSI */}
          <Card className={cn("border", getSignalColor(rsiStatus.signal))}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">RSI (14日)</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    rsiStatus.signal === 'buy' && "border-green-500 text-green-700",
                    rsiStatus.signal === 'sell' && "border-red-500 text-red-700",
                    rsiStatus.signal === 'neutral' && "border-gray-500 text-gray-700"
                  )}
                >
                  {getSignalIcon(rsiStatus.signal)}
                  <span className="ml-1">{rsiStatus.label}</span>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={cn("text-2xl font-bold", rsiStatus.color)}>
                  {indicators.rsi ? indicators.rsi.toFixed(1) : '--'}
                </span>
                {indicators.rsi && (
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          indicators.rsi > 70 ? "bg-red-500" : 
                          indicators.rsi < 30 ? "bg-green-500" : "bg-blue-500"
                        )}
                        style={{ width: `${indicators.rsi}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>30</span>
                      <span>70</span>
                      <span>100</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* MACD */}
          <Card className={cn("border", getSignalColor(macdStatus.signal))}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <LineChart className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">MACD</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    macdStatus.signal === 'buy' && "border-green-500 text-green-700",
                    macdStatus.signal === 'sell' && "border-red-500 text-red-700",
                    macdStatus.signal === 'neutral' && "border-gray-500 text-gray-700"
                  )}
                >
                  {getSignalIcon(macdStatus.signal)}
                  <span className="ml-1">{macdStatus.label}</span>
                </Badge>
              </div>
              
              {indicators.macd ? (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">MACD</p>
                    <p className="font-semibold">{indicators.macd.macd?.toFixed(3) || '--'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Signal</p>
                    <p className="font-semibold">{indicators.macd.signal?.toFixed(3) || '--'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Histogram</p>
                    <p className={cn(
                      "font-semibold",
                      indicators.macd.histogram && indicators.macd.histogram > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {indicators.macd.histogram?.toFixed(3) || '--'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">データなし</p>
              )}
            </CardContent>
          </Card>

          {/* ボリンジャーバンド */}
          <Card className={cn("border", getSignalColor(bbStatus.signal))}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">ボリンジャーバンド</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    bbStatus.signal === 'buy' && "border-green-500 text-green-700",
                    bbStatus.signal === 'sell' && "border-red-500 text-red-700",
                    bbStatus.signal === 'neutral' && "border-gray-500 text-gray-700"
                  )}
                >
                  {getSignalIcon(bbStatus.signal)}
                  <span className="ml-1">{bbStatus.label}</span>
                </Badge>
              </div>
              
              {indicators.bollinger_bands ? (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">上限</p>
                    <p className="font-semibold text-red-600">
                      ${indicators.bollinger_bands.upper?.toFixed(2) || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">中央線</p>
                    <p className="font-semibold">
                      ${indicators.bollinger_bands.middle?.toFixed(2) || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">下限</p>
                    <p className="font-semibold text-green-600">
                      ${indicators.bollinger_bands.lower?.toFixed(2) || '--'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">データなし</p>
              )}
            </CardContent>
          </Card>

          {/* 移動平均線 */}
          {indicators.moving_averages && (
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-sm">移動平均線</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">SMA20</p>
                    <p className="font-semibold">
                      ${indicators.moving_averages.sma_20?.toFixed(2) || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">SMA50</p>
                    <p className="font-semibold">
                      ${indicators.moving_averages.sma_50?.toFixed(2) || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">SMA200</p>
                    <p className="font-semibold">
                      ${indicators.moving_averages.sma_200?.toFixed(2) || '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};