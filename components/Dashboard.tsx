'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Activity, 
  BarChart3,
  AlertCircle,
  Target,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { stockAPI, MarketData, TopMover } from '@/lib/api';
import { MarketAlertService, MarketAlert } from '@/lib/market-alert-service';
import { TradingSignal } from '@/lib/technical-analysis';

interface StockData {
  symbol: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  volume: number;
}

interface DashboardProps {
  selectedSymbol?: string;
  stockData?: StockData;
  technicalData?: Record<string, unknown>;
  analysisData?: Record<string, unknown>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedSymbol,
  stockData
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [, setMarketData] = useState<MarketData[]>([
    { symbol: 'S&P 500', value: 0, change: 0, changePercent: 0 },
    { symbol: 'NASDAQ', value: 0, change: 0, changePercent: 0 },
    { symbol: 'DOW', value: 0, change: 0, changePercent: 0 },
    { symbol: 'VIX', value: 0, change: 0, changePercent: 0 }
  ]);
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 市場データを取得する関数
  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      const [marketOverview, movers, alerts] = await Promise.all([
        stockAPI.getMarketOverview(),
        stockAPI.getTopMovers(),
        MarketAlertService.generateMarketAlerts()
      ]);
      setMarketData(marketOverview);
      setTopMovers(movers);
      setMarketAlerts(alerts);
      
      // 注目銘柄のトレーディングシグナルを生成
      await generateTradingSignals(movers.slice(0, 3));
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('市場データ取得エラー:', error);
      // エラー時はデモデータを使用
      setMarketData([
        { symbol: 'S&P 500', value: 5547.25, change: 12.45, changePercent: 0.23 },
        { symbol: 'NASDAQ', value: 17833.45, change: -23.12, changePercent: -0.13 },
        { symbol: 'DOW', value: 39308.00, change: 34.67, changePercent: 0.09 },
        { symbol: 'VIX', value: 12.45, change: -0.87, changePercent: -6.53 }
      ]);
      setTopMovers([
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 138.95, change: 2.45, changePercent: 1.79 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 271.99, change: -3.21, changePercent: -1.17 },
        { symbol: 'AAPL', name: 'Apple Inc', price: 227.52, change: -1.23, changePercent: -0.54 },
        { symbol: 'META', name: 'Meta Platforms Inc', price: 568.73, change: 8.45, changePercent: 1.51 }
      ]);
      
      // エラー時も基本的なアラートとシグナルを生成
      setMarketAlerts([
        {
          id: 'fallback-vix',
          type: 'WARNING',
          category: 'VOLATILITY',
          title: 'VIX上昇中',
          description: '市場のボラティリティが増加しています',
          timestamp: new Date().toISOString(),
          priority: 6
        },
        {
          id: 'fallback-sector',
          type: 'INFO',
          category: 'SECTOR',
          title: 'セクターローテーション',
          description: 'テクノロジー株から金融株への資金移動',
          timestamp: new Date().toISOString(),
          priority: 5
        }
      ]);
      
      setTradingSignals([
        { type: 'BUY', symbol: 'NVDA', confidence: 85, reason: 'テクニカルブレイクアウト', strength: 80, indicators: { rsi: { value: 35, signal: 'BUY' }, macd: { value: 1.2, signal: 'BUY' }, bollinger: { position: 'LOWER', signal: 'BUY' }, moving_average: { signal: 'BUY' }, volume: { signal: 'HIGH' } } },
        { type: 'SELL', symbol: 'AAPL', confidence: 78, reason: '利確ゾーン到達', strength: 65, indicators: { rsi: { value: 75, signal: 'SELL' }, macd: { value: -0.8, signal: 'SELL' }, bollinger: { position: 'UPPER', signal: 'SELL' }, moving_average: { signal: 'SELL' }, volume: { signal: 'NORMAL' } } },
        { type: 'HOLD', symbol: 'MSFT', confidence: 72, reason: 'レンジ相場継続', strength: 50, indicators: { rsi: { value: 55, signal: 'NEUTRAL' }, macd: { value: 0.1, signal: 'NEUTRAL' }, bollinger: { position: 'MIDDLE', signal: 'NEUTRAL' }, moving_average: { signal: 'NEUTRAL' }, volume: { signal: 'NORMAL' } } }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 初期データ取得
    fetchMarketData();
    
    // 30秒ごとに更新
    const timer = setInterval(() => {
      console.log('リアルタイム更新実行中...');
      fetchMarketData();
    }, 30000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // リアルタイムアラート更新（1分ごと）
  useEffect(() => {
    const alertTimer = setInterval(async () => {
      try {
        console.log('アラート更新中...');
        const alerts = await MarketAlertService.generateMarketAlerts();
        setMarketAlerts(alerts);
      } catch (error) {
        console.error('アラート更新エラー:', error);
      }
    }, 60000); // 1分ごと

    return () => clearInterval(alertTimer);
  }, []);

  // selectedSymbolが変更された時のシグナル更新
  useEffect(() => {
    if (selectedSymbol && stockData) {
      // 選択された銘柄の詳細シグナルを生成
      generateTradingSignals([{
        symbol: selectedSymbol,
        name: stockData.name || selectedSymbol,
        price: stockData.current_price || 0,
        change: stockData.change || 0,
        changePercent: stockData.change_percent || 0
      }]);
    }
  }, [selectedSymbol, stockData]);

  // トレーディングシグナルを生成する関数
  const generateTradingSignals = async (stocks: TopMover[]) => {
    const signals: TradingSignal[] = [];
    
    for (const stock of stocks) {
      try {
        // 実際の分析データを取得してシグナル生成
        const response = await fetch(`/api/stock/stocks/${stock.symbol}/analysis`);
        if (response.ok) {
          const analysisData = await response.json();
          if (analysisData.technical_indicators) {
            const signal: TradingSignal = {
              type: analysisData.analysis.recommendation,
              symbol: stock.symbol,
              confidence: Math.round(analysisData.analysis.confidence * 100),
              reason: analysisData.analysis.reasoning?.[0] || 'テクニカル分析に基づく判定',
              strength: analysisData.advanced_trading?.market_environment?.strength || 75,
              indicators: analysisData.technical_indicators
            };
            signals.push(signal);
          }
        }
      } catch (error) {
        console.error(`シグナル生成エラー (${stock.symbol}):`, error);
      }
    }
    
    setTradingSignals(signals);
  };

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
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-pulse"
              )}></div>
              <span className="text-xs text-gray-500">
                {isLoading ? '更新中' : 'ライブ'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMarketData}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              更新
            </Button>
          </div>
        </div>
      </div>

      {/* 市場概況 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.symbol}
                  </p>
                  <p className="text-2xl font-bold text-foreground" style={{ color: '#1f2937' }}>
                    {isLoading && item.value === 0 ? 'Loading...' : item.value.toLocaleString()}
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
                <span className="text-sm font-medium" style={{ 
                  color: item.change > 0 ? '#059669' : '#dc2626' 
                }}>
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
                </span>
                <span className="text-sm" style={{ 
                  color: item.change > 0 ? '#059669' : '#dc2626' 
                }}>
                  ({(item.change > 0 ? '+' : '') + item.changePercent.toFixed(2)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

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
                {topMovers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{stock.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground" style={{ color: '#1f2937' }}>
                          {stock.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground" style={{ color: '#6b7280' }}>
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground" style={{ color: '#1f2937' }}>
                        ${stock.price.toFixed(2)}
                      </p>
                      <p className="text-sm font-medium" style={{ 
                        color: stock.changePercent > 0 ? '#059669' : '#dc2626' 
                      }}>
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
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
                {tradingSignals.length > 0 ? tradingSignals.map((signal, index) => (
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">信頼度</span>
                      <span className="text-sm font-medium">{signal.confidence}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-1">
                      <div>RSI: {signal.indicators.rsi.value} ({signal.indicators.rsi.signal})</div>
                      <div>MACD: {signal.indicators.macd.signal}</div>
                      <div>ボリンジャー: {signal.indicators.bollinger.position}</div>
                      <div>強度: {signal.strength}%</div>
                    </div>
                  </div>
                )) : (
                  <div className="p-3 text-center text-gray-500">
                    {isLoading ? 'シグナル分析中...' : 'シグナルデータを読み込んでいます'}
                  </div>
                )}
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
                {marketAlerts.length > 0 ? marketAlerts.slice(0, 5).map((alert, index) => (
                  <div 
                    key={alert.id || index} 
                    className={cn(
                      "p-3 rounded-lg border",
                      MarketAlertService.getAlertStyle(alert)
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "text-sm font-medium",
                        MarketAlertService.getAlertTextStyle(alert)
                      )}>
                        {alert.title}
                      </p>
                      {alert.priority > 7 && (
                        <Badge variant="destructive" className="text-xs">
                          重要
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-1",
                      MarketAlertService.getAlertDescriptionStyle(alert)
                    )}>
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {alert.category} | 優先度: {alert.priority}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-3 text-center text-gray-500">
                    {isLoading ? 'アラート分析中...' : 'アラートデータを読み込んでいます'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};