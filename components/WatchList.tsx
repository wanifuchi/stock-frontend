'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Star, TrendingUp, TrendingDown, RefreshCw, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StockSearch } from '@/components/StockSearch';
import { stockAPI, StockInfo } from '@/lib/api';
import { cn } from '@/lib/utils';

interface WatchListItem {
  symbol: string;
  addedAt: string;
  stockInfo?: StockInfo;
  alertPrice?: number;
  alertType?: 'above' | 'below';
}

interface WatchListProps {
  className?: string;
}

export const WatchList: React.FC<WatchListProps> = ({ className }) => {
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  // ローカルストレージからウォッチリストを読み込み
  useEffect(() => {
    const savedWatchList = localStorage.getItem('stock-watchlist');
    if (savedWatchList) {
      setWatchList(JSON.parse(savedWatchList));
    }
  }, []);

  // ウォッチリストが変更されたときにローカルストレージに保存
  useEffect(() => {
    if (watchList.length > 0) {
      localStorage.setItem('stock-watchlist', JSON.stringify(watchList));
    }
  }, [watchList]);

  // 株価を更新
  const updatePrices = async () => {
    if (watchList.length === 0) return;
    
    setIsUpdating(true);
    try {
      const updatedWatchList = await Promise.all(
        watchList.map(async (item) => {
          try {
            const stockInfo = await stockAPI.getStockInfo(item.symbol);
            
            // 価格アラートのチェック
            if (item.alertPrice && stockInfo.current_price) {
              const shouldAlert = item.alertType === 'above' 
                ? stockInfo.current_price >= item.alertPrice
                : stockInfo.current_price <= item.alertPrice;
                
              if (shouldAlert) {
                // ブラウザ通知
                if (Notification.permission === 'granted') {
                  new Notification(`価格アラート: ${item.symbol}`, {
                    body: `現在価格: $${stockInfo.current_price.toFixed(2)}`,
                    icon: '/favicon.ico'
                  });
                }
              }
            }
            
            return {
              ...item,
              stockInfo
            };
          } catch (error) {
            console.error(`Error updating ${item.symbol}:`, error);
            return item;
          }
        })
      );
      setWatchList(updatedWatchList);
    } catch (error) {
      console.error('Watch list update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 初回ロード時に価格を更新
  useEffect(() => {
    if (watchList.length > 0) {
      updatePrices();
      
      // 通知許可を要求
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // 定期的な価格更新（5分ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      if (watchList.length > 0) {
        updatePrices();
      }
    }, 5 * 60 * 1000); // 5分

    return () => clearInterval(interval);
  }, [watchList]);

  // 銘柄を追加
  const addToWatchList = (symbol: string) => {
    if (watchList.some(item => item.symbol === symbol)) {
      alert('この銘柄は既にウォッチリストに追加されています。');
      return;
    }

    const newItem: WatchListItem = {
      symbol,
      addedAt: new Date().toISOString(),
      alertPrice: alertPrice ? parseFloat(alertPrice) : undefined,
      alertType: alertType
    };

    setWatchList(prev => [...prev, newItem]);
    setShowAddForm(false);
    setAlertPrice('');
    
    // 追加後すぐに株価を取得
    setTimeout(() => updatePrices(), 500);
  };

  // 銘柄を削除
  const removeFromWatchList = (symbol: string) => {
    setWatchList(prev => prev.filter(item => item.symbol !== symbol));
  };

  // アラート設定を更新
  const updateAlert = (symbol: string, alertPrice: number, alertType: 'above' | 'below') => {
    setWatchList(prev => 
      prev.map(item => 
        item.symbol === symbol 
          ? { ...item, alertPrice, alertType }
          : item
      )
    );
  };

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

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">ウォッチリスト</h2>
            <div className="flex space-x-2">
              <Button
                onClick={updatePrices}
                disabled={isUpdating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isUpdating && "animate-spin")} />
                {isUpdating ? '更新中...' : '更新'}
              </Button>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                追加
              </Button>
            </div>
          </div>

          {/* 追加フォーム */}
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">銘柄を追加</h3>
              <div className="space-y-4">
                <StockSearch 
                  onSelectStock={addToWatchList}
                  placeholder="銘柄コードまたは企業名を検索..."
                />
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      価格アラート（オプション）
                    </label>
                    <Input
                      type="number"
                      placeholder="アラート価格"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      アラート条件
                    </label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="above">以上</option>
                      <option value="below">以下</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ウォッチリスト */}
          {watchList.length > 0 ? (
            <div className="space-y-3">
              {watchList.map((item, index) => {
                const stock = item.stockInfo;
                const isPositive = stock?.change && stock.change >= 0;

                return (
                  <div key={item.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <div>
                          <p className="font-semibold">{item.symbol}</p>
                          {stock && (
                            <p className="text-sm text-gray-600">{stock.name}</p>
                          )}
                        </div>
                      </div>
                      
                      {item.alertPrice && (
                        <Badge variant="outline" className="text-xs">
                          アラート: ${item.alertPrice} {item.alertType === 'above' ? '以上' : '以下'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      {stock ? (
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(stock.current_price)}
                          </p>
                          <div className="flex items-center space-x-1">
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={cn(
                              "text-sm",
                              isPositive ? "text-green-600" : "text-red-600"
                            )}>
                              {formatCurrency(stock.change)} ({formatPercent(stock.change_percent)})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">読み込み中...</div>
                      )}

                      <Button
                        onClick={() => removeFromWatchList(item.symbol)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">ウォッチリストが空です</h3>
              <p className="text-gray-600 mb-6">
                気になる銘柄を追加して価格をトラッキングしましょう
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                銘柄を追加
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};