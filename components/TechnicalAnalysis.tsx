'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  AlertTriangle,
  CheckCircle,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface TechnicalAnalysisProps {
  symbol: string;
  indicators?: {
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollinger_bands: {
      upper: number;
      middle: number;
      lower: number;
    };
    moving_averages: {
      sma_20: number;
      sma_50: number;
      sma_200: number;
    };
  };
  currentPrice?: number;
}

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({
  symbol,
  indicators,
  currentPrice = 150
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<'rsi' | 'macd' | 'bb' | 'sma'>('rsi');

  // デモデータ生成（固定値を使用してSSRの一貫性を保つ）
  const demoIndicators = useMemo(() => {
    if (indicators) return indicators;
    
    return {
      rsi: 65.4,
      macd: {
        macd: 2.34,
        signal: 1.87,
        histogram: 0.47
      },
      bollinger_bands: {
        upper: Math.round(currentPrice * 1.05 * 100) / 100,
        middle: Math.round(currentPrice * 100) / 100,
        lower: Math.round(currentPrice * 0.95 * 100) / 100
      },
      moving_averages: {
        sma_20: Math.round(currentPrice * 0.98 * 100) / 100,
        sma_50: Math.round(currentPrice * 0.95 * 100) / 100,
        sma_200: Math.round(currentPrice * 0.92 * 100) / 100
      }
    };
  }, [indicators, currentPrice]);

  // RSIの判定
  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { type: 'SELL', label: '買われすぎ', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (rsi < 30) return { type: 'BUY', label: '売られすぎ', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { type: 'NEUTRAL', label: '中立', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  // MACDの判定
  const getMACDSignal = (macd: number, signal: number) => {
    if (macd > signal) return { type: 'BUY', label: '買いシグナル', color: 'text-green-600' };
    return { type: 'SELL', label: '売りシグナル', color: 'text-red-600' };
  };

  // ボリンジャーバンドの判定
  const getBBSignal = (price: number, upper: number, lower: number) => {
    if (price > upper) return { type: 'SELL', label: '上限突破', color: 'text-red-600' };
    if (price < lower) return { type: 'BUY', label: '下限接触', color: 'text-green-600' };
    return { type: 'NEUTRAL', label: '正常範囲', color: 'text-gray-600' };
  };

  const rsiSignal = getRSISignal(demoIndicators.rsi);
  const macdSignal = getMACDSignal(demoIndicators.macd.macd, demoIndicators.macd.signal);
  const bbSignal = getBBSignal(currentPrice, demoIndicators.bollinger_bands.upper, demoIndicators.bollinger_bands.lower);

  // チャートデータの状態管理
  const [rsiChartData, setRsiChartData] = useState<{dates: string[], values: number[]}>({ dates: [], values: [] });
  const [macdChartData, setMacdChartData] = useState<{dates: string[], macd: number[], signal: number[]}>({ dates: [], macd: [], signal: [] });

  // RSIチャートデータの生成（クライアントサイドのみ）
  useEffect(() => {
    const dates = [];
    const rsiValues = [];
    
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
      
      // RSI値を生成（現在値に近い値、シード値を使用）
      const baseRsi = demoIndicators.rsi;
      const seed = Math.sin(i * 0.1) * 10; // 決定論的なバリエーション
      const rsi = Math.max(0, Math.min(100, baseRsi + seed));
      rsiValues.push(Math.round(rsi * 10) / 10);
    }
    
    setRsiChartData({ dates, values: rsiValues });
  }, [demoIndicators.rsi]);

  // MACDチャートデータの生成（クライアントサイドのみ）
  useEffect(() => {
    const dates = [];
    const macdValues = [];
    const signalValues = [];
    
    for (let i = 20; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
      
      const baseMacd = demoIndicators.macd.macd;
      const baseSignal = demoIndicators.macd.signal;
      const variation = Math.sin(i * 0.2) * 1; // 決定論的なバリエーション
      
      macdValues.push(Math.round((baseMacd + variation) * 100) / 100);
      signalValues.push(Math.round((baseSignal + variation * 0.8) * 100) / 100);
    }
    
    setMacdChartData({ dates, macd: macdValues, signal: signalValues });
  }, [demoIndicators.macd]);

  // RSIチャート設定
  const rsiChartOption = {
    title: {
      text: 'RSI (Relative Strength Index)',
      textStyle: { fontSize: 14, color: '#374151' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        return `${params[0].axisValue}<br/>RSI: ${params[0].value.toFixed(1)}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: rsiChartData.dates,
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { fontSize: 10 }
    },
    series: [
      {
        type: 'line',
        data: rsiChartData.values,
        smooth: true,
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
      }
    ],
    markLine: {
      data: [
        { yAxis: 70, lineStyle: { color: '#ef4444', type: 'dashed' } },
        { yAxis: 30, lineStyle: { color: '#22c55e', type: 'dashed' } }
      ]
    }
  };

  // MACDチャート設定
  const macdChartOption = {
    title: {
      text: 'MACD',
      textStyle: { fontSize: 14, color: '#374151' }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['MACD', 'Signal'],
      top: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: macdChartData.dates,
      axisLabel: { fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10 }
    },
    series: [
      {
        name: 'MACD',
        type: 'line',
        data: macdChartData.macd,
        lineStyle: { color: '#8b5cf6', width: 2 }
      },
      {
        name: 'Signal',
        type: 'line',
        data: macdChartData.signal,
        lineStyle: { color: '#f59e0b', width: 2 }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          テクニカル分析 - {symbol}
        </h2>
        <div className="flex space-x-2">
          {['rsi', 'macd', 'bb', 'sma'].map((indicator) => (
            <Button
              key={indicator}
              variant={selectedIndicator === indicator ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedIndicator(indicator as any)}
            >
              {indicator.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* 指標サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* RSI */}
        <Card className={cn("border-2", rsiSignal.bgColor)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">RSI</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {demoIndicators.rsi.toFixed(1)}
            </div>
            <Badge variant="outline" className={rsiSignal.color}>
              {rsiSignal.label}
            </Badge>
          </CardContent>
        </Card>

        {/* MACD */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">MACD</span>
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {demoIndicators.macd.macd.toFixed(2)}
            </div>
            <Badge variant="outline" className={macdSignal.color}>
              {macdSignal.label}
            </Badge>
          </CardContent>
        </Card>

        {/* ボリンジャーバンド */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">BB</span>
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-sm space-y-1">
              <div>上限: ${demoIndicators.bollinger_bands.upper.toFixed(2)}</div>
              <div>中央: ${demoIndicators.bollinger_bands.middle.toFixed(2)}</div>
              <div>下限: ${demoIndicators.bollinger_bands.lower.toFixed(2)}</div>
            </div>
            <Badge variant="outline" className={bbSignal.color}>
              {bbSignal.label}
            </Badge>
          </CardContent>
        </Card>

        {/* 移動平均線 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">SMA</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm space-y-1">
              <div>20日: ${demoIndicators.moving_averages.sma_20.toFixed(2)}</div>
              <div>50日: ${demoIndicators.moving_averages.sma_50.toFixed(2)}</div>
              <div>200日: ${demoIndicators.moving_averages.sma_200.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI詳細チャート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>RSI 詳細</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ReactECharts
                option={rsiChartOption}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* MACD詳細チャート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>MACD 詳細</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ReactECharts
                option={macdChartOption}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* シグナル統合判定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>統合シグナル判定</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              {rsiSignal.type === 'BUY' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : rsiSignal.type === 'SELL' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium">RSI</p>
                <p className="text-sm text-gray-600">{rsiSignal.label}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              {macdSignal.type === 'BUY' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">MACD</p>
                <p className="text-sm text-gray-600">{macdSignal.label}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              {bbSignal.type === 'BUY' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : bbSignal.type === 'SELL' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium">ボリンジャーバンド</p>
                <p className="text-sm text-gray-600">{bbSignal.label}</p>
              </div>
            </div>
          </div>

          {/* 総合判定 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">総合判定</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              現在のテクニカル指標は中立的なシグナルを示しています。RSIは正常範囲内、MACDは{macdSignal.label}、
              ボリンジャーバンドは{bbSignal.label}となっており、慎重な判断が必要です。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};