'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { stockAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

interface MarketOverviewProps {
  className?: string;
}

const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ 100' },
  { symbol: 'DIA', name: 'ダウ平均' },
  { symbol: 'IWM', name: 'ラッセル2000' },
  { symbol: 'VTI', name: '全米株式' },
];

const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
  'NVDA', 'META', 'NFLX', 'ORCL', 'CRM'
];

const CRYPTO_SYMBOLS = [
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: 'BNB-USD', name: 'Binance Coin' },
];

export const MarketOverview: React.FC<MarketOverviewProps> = ({ className }) => {
  const [marketData, setMarketData] = useState<{
    indices: MarketData[];
    stocks: MarketData[];
    crypto: MarketData[];
  }>({
    indices: [],
    stocks: [],
    crypto: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 市場データを取得
  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      // インデックスデータを取得
      const indicesPromises = MARKET_INDICES.map(async (index) => {
        try {
          const data = await stockAPI.getStockInfo(index.symbol);
          return {
            symbol: index.symbol,
            name: index.name,
            price: data.current_price,
            change: data.change,
            changePercent: data.change_percent,
            volume: data.volume
          };
        } catch (error) {
          console.error(`Error fetching ${index.symbol}:`, error);
          return null;
        }
      });

      // 人気株データを取得（最初の5つ）
      const stocksPromises = POPULAR_STOCKS.slice(0, 5).map(async (symbol) => {
        try {
          const data = await stockAPI.getStockInfo(symbol);
          return {
            symbol,
            name: data.name,
            price: data.current_price,
            change: data.change,
            changePercent: data.change_percent,
            volume: data.volume
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return null;
        }
      });

      // 暗号通貨データを取得（利用可能な場合）
      const cryptoPromises = CRYPTO_SYMBOLS.map(async (crypto) => {
        try {
          const data = await stockAPI.getStockInfo(crypto.symbol);
          return {
            symbol: crypto.symbol,
            name: crypto.name,
            price: data.current_price,
            change: data.change,
            changePercent: data.change_percent
          };
        } catch (error) {
          console.error(`Error fetching ${crypto.symbol}:`, error);
          return null;
        }
      });

      const [indicesResults, stocksResults, cryptoResults] = await Promise.all([
        Promise.all(indicesPromises),
        Promise.all(stocksPromises),
        Promise.all(cryptoPromises)
      ]);

      setMarketData({
        indices: indicesResults.filter(Boolean) as MarketData[],
        stocks: stocksResults.filter(Boolean) as MarketData[],
        crypto: cryptoResults.filter(Boolean) as MarketData[]
      });

      setLastUpdate(new Date().toLocaleTimeString('ja-JP'));
    } catch (error) {
      console.error('Market data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchMarketData();
  }, []);

  // 定期更新（15分ごと）
  useEffect(() => {
    const interval = setInterval(fetchMarketData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(1)}B`;
    } else if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(1)}M`;
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const MarketDataCard = ({ title, data, icon: Icon }: { 
    title: string; 
    data: MarketData[]; 
    icon: React.ComponentType<any> 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <div className="space-y-3">
          {data.length > 0 ? data.map((item) => {
            const isPositive = item.change >= 0;
            return (
              <div key={item.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{item.symbol}</span>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  {item.volume && (
                    <p className="text-xs text-gray-500">
                      出来高: {formatVolume(item.volume)}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(item.price)}</p>
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(item.change)} ({formatPercent(item.changePercent)})
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-500">
              <p>データを読み込み中...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* ヘッダー */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">マーケット概況</h2>
              {lastUpdate && (
                <p className="text-sm text-gray-600">
                  最終更新: {lastUpdate}
                </p>
              )}
            </div>
            <Button
              onClick={fetchMarketData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              {isLoading ? '更新中...' : '更新'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 市場概況 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <MarketDataCard
          title="主要指数"
          data={marketData.indices}
          icon={TrendingUp}
        />
        
        <MarketDataCard
          title="人気株"
          data={marketData.stocks}
          icon={Activity}
        />
        
        {marketData.crypto.length > 0 && (
          <MarketDataCard
            title="仮想通貨"
            data={marketData.crypto}
            icon={Globe}
          />
        )}
      </div>

      {/* 市場サマリー */}
      {marketData.indices.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">市場サマリー</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 上昇銘柄数 */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-green-600 font-medium">上昇</p>
                <p className="text-2xl font-bold text-green-900">
                  {[...marketData.indices, ...marketData.stocks].filter(item => item.change >= 0).length}
                </p>
              </div>

              {/* 下落銘柄数 */}
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-red-600 font-medium">下落</p>
                <p className="text-2xl font-bold text-red-900">
                  {[...marketData.indices, ...marketData.stocks].filter(item => item.change < 0).length}
                </p>
              </div>

              {/* 全体出来高 */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">総出来高</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatVolume(
                    [...marketData.indices, ...marketData.stocks]
                      .reduce((sum, item) => sum + (item.volume || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};