'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  AlertCircle,
  Target,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  selectedSymbol?: string;
  stockData?: any;
  technicalData?: any;
  analysisData?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedSymbol,
  stockData,
  technicalData,
  analysisData
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // 初期設定
    setLastUpdate(new Date());
    
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // 30秒ごとに更新時刻を更新

    return () => clearInterval(timer);
  }, []);

  // デモデータ（実際のデータがない場合）
  const demoMarketData = [
    { symbol: 'S&P 500', value: 4856.23, change: 23.45, changePercent: 0.48 },
    { symbol: 'NASDAQ', value: 15234.67, change: 89.12, changePercent: 0.59 },
    { symbol: 'DOW', value: 37543.89, change: -45.67, changePercent: -0.12 },
    { symbol: 'VIX', value: 12.34, change: -0.87, changePercent: -6.58 }
  ];

  const demoTopMovers = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.43, change: 34.56, changePercent: 4.12 },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 267.89, change: 12.34, changePercent: 4.84 },
    { symbol: 'AAPL', name: 'Apple Inc', price: 182.34, change: -2.45, changePercent: -1.33 },
    { symbol: 'META', name: 'Meta Platforms', price: 423.67, change: 8.90, changePercent: 2.14 }
  ];

  const demoSignals = [
    { type: 'BUY', symbol: 'NVDA', confidence: 85, reason: 'テクニカルブレイクアウト' },
    { type: 'SELL', symbol: 'AAPL', confidence: 78, reason: '利確ゾーン到達' },
    { type: 'HOLD', symbol: 'MSFT', confidence: 72, reason: 'レンジ相場継続' }
  ];

  return (
    <div className="space-y-6">
      {/* ダッシュボードヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            トレーディングダッシュボード
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            リアルタイム市場データと AI 分析
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            最終更新: {lastUpdate ? lastUpdate.toLocaleTimeString('ja-JP') : '--:--:--'}
          </p>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* 市場概況 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoMarketData.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.symbol}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </p>
                </div>
                <div className={cn(
                  "flex items-center space-x-1",
                  item.change > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {item.change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className={cn(
                "flex items-center space-x-2 mt-2",
                item.change > 0 ? "text-green-600" : "text-red-600"
              )}>
                <span className="text-sm font-medium">
                  {item.change > 0 ? '+' : ''}{item.change}
                </span>
                <span className="text-sm">
                  ({item.change > 0 ? '+' : ''}{item.changePercent}%)
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 選択された銘柄の詳細 */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSymbol && stockData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{stockData.symbol}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{stockData.name}</p>
                    </div>
                  </div>
                  <Badge variant={stockData.change > 0 ? "default" : "destructive"}>
                    {stockData.change > 0 ? '+' : ''}{stockData.change_percent}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">現在価格</p>
                    <p className="text-2xl font-bold">${stockData.current_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">高値</p>
                    <p className="text-lg font-semibold">${stockData.high}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">安値</p>
                    <p className="text-lg font-semibold">${stockData.low}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">出来高</p>
                    <p className="text-lg font-semibold">{stockData.volume?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  銘柄を選択してください
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  検索バーから銘柄を検索して詳細分析を開始
                </p>
              </CardContent>
            </Card>
          )}

          {/* 上位値動き銘柄 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>注目銘柄</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoTopMovers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{stock.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-32">
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">${stock.price}</p>
                      <p className={cn(
                        "text-sm font-medium",
                        stock.change > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {stock.change > 0 ? '+' : ''}{stock.changePercent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイドパネル */}
        <div className="space-y-6">
          {/* AI シグナル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>AI トレーディングシグナル</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoSignals.map((signal, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={signal.type === 'BUY' ? 'default' : signal.type === 'SELL' ? 'destructive' : 'secondary'}
                      >
                        {signal.type}
                      </Badge>
                      <span className="text-sm font-medium">{signal.symbol}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {signal.reason}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">信頼度</span>
                      <span className="text-sm font-medium">{signal.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 市場アラート */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>市場アラート</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    VIX上昇中
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    市場のボラティリティが増加しています
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    セクターローテーション
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    テクノロジー株から金融株への資金移動
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};