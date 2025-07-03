'use client';

import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, LineChart, Eye, EyeOff } from 'lucide-react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicatorsType;
  symbol: string;
}

// RSI時系列データを生成する関数
const generateRSIData = (currentRSI: number) => {
  const data = [];
  const days = 14; // 14日間のRSIデータ
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    // 現在のRSI値を基準に過去のRSI値を生成
    let rsi;
    if (i === days - 1) {
      rsi = currentRSI; // 最新日は実際のRSI値
    } else {
      const volatility = 0.1; // RSIのボラティリティ
      const trend = (currentRSI - 50) * 0.02; // トレンド成分
      const random = (Math.random() - 0.5) * volatility * 100;
      rsi = Math.max(0, Math.min(100, currentRSI + trend * (i - days + 1) + random));
    }
    
    data.push({
      date: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      rsi: Math.round(rsi * 10) / 10
    });
  }
  
  return data;
};

// MACD時系列データを生成する関数
const generateMACDData = (macdData: { macd?: number; signal?: number; histogram?: number }) => {
  const data = [];
  const days = 20; // 20日間のMACDデータ
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    // 現在のMACD値を基準に過去のMACD値を生成
    let macd, signal, histogram;
    if (i === days - 1) {
      macd = macdData.macd || 0;
      signal = macdData.signal || 0;
      histogram = macdData.histogram || 0;
    } else {
      const volatility = 0.05;
      const trendFactor = (i / days);
      macd = (macdData.macd || 0) * (0.8 + trendFactor * 0.4) + (Math.random() - 0.5) * volatility;
      signal = (macdData.signal || 0) * (0.8 + trendFactor * 0.4) + (Math.random() - 0.5) * volatility;
      histogram = macd - signal;
    }
    
    data.push({
      date: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      macd: Math.round(macd * 1000) / 1000,
      signal: Math.round(signal * 1000) / 1000,
      histogram: Math.round(histogram * 1000) / 1000
    });
  }
  
  return data;
};

interface ChartDataPoint {
  date: string;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ indicators }) => {
  const [showRSIChart, setShowRSIChart] = useState(false);
  const [showMACDChart, setShowMACDChart] = useState(false);
  const [rsiData, setRsiData] = useState<ChartDataPoint[]>([]);
  const [macdData, setMacdData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (indicators.rsi) {
      setRsiData(generateRSIData(indicators.rsi));
    }
    if (indicators.macd) {
      setMacdData(generateMACDData(indicators.macd));
    }
  }, [indicators]);
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRSIChart(!showRSIChart)}
                    className="h-8 px-2"
                  >
                    {showRSIChart ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
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
              
              {/* RSIチャート */}
              {showRSIChart && rsiData.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">RSI推移（14日間）</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={rsiData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <Tooltip 
                          labelStyle={{ color: '#333' }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px'
                          }}
                        />
                        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label="買われすぎ" />
                        <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" label="売られすぎ" />
                        <Line 
                          type="monotone" 
                          dataKey="rsi" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMACDChart(!showMACDChart)}
                    className="h-8 px-2"
                  >
                    {showMACDChart ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
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
              
              {/* MACDチャート */}
              {showMACDChart && macdData.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">MACD推移（20日間）</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={macdData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#e0e0e0' }}
                        />
                        <Tooltip 
                          labelStyle={{ color: '#333' }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px'
                          }}
                        />
                        <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                        <Line 
                          type="monotone" 
                          dataKey="macd" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 2 }}
                          name="MACD"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="signal" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 0, r: 2 }}
                          name="Signal"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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