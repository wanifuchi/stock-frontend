'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { stockAPI, StockInfo } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PortfolioStock {
  symbol: string;
  shares: number;
  buyPrice: number;
  currentPrice?: number;
  stockInfo?: StockInfo;
}

interface PortfolioTrackerProps {
  className?: string;
}

export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({ className }) => {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [newStock, setNewStock] = useState({
    symbol: '',
    shares: '',
    buyPrice: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ローカルストレージからポートフォリオを読み込み
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('stock-portfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  // ポートフォリオが変更されたときにローカルストレージに保存
  useEffect(() => {
    if (portfolio.length > 0) {
      localStorage.setItem('stock-portfolio', JSON.stringify(portfolio));
    }
  }, [portfolio]);

  // 現在価格を更新
  const updateCurrentPrices = async () => {
    if (portfolio.length === 0) return;
    
    setIsUpdating(true);
    try {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (stock) => {
          try {
            const stockInfo = await stockAPI.getStockInfo(stock.symbol);
            return {
              ...stock,
              currentPrice: stockInfo.current_price,
              stockInfo
            };
          } catch (error) {
            console.error(`Error updating ${stock.symbol}:`, error);
            return stock; // 更新失敗時は元のデータを保持
          }
        })
      );
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Portfolio update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 初回ロード時に価格を更新
  useEffect(() => {
    if (portfolio.length > 0 && portfolio.some(stock => !stock.currentPrice)) {
      updateCurrentPrices();
    }
  }, []);

  // 新しい銘柄を追加
  const addStock = async () => {
    if (!newStock.symbol || !newStock.shares || !newStock.buyPrice) return;

    setIsLoading(true);
    try {
      const stockInfo = await stockAPI.getStockInfo(newStock.symbol.toUpperCase());
      
      const portfolioStock: PortfolioStock = {
        symbol: newStock.symbol.toUpperCase(),
        shares: parseFloat(newStock.shares),
        buyPrice: parseFloat(newStock.buyPrice),
        currentPrice: stockInfo.current_price,
        stockInfo
      };

      setPortfolio(prev => [...prev, portfolioStock]);
      setNewStock({ symbol: '', shares: '', buyPrice: '' });
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('銘柄の追加に失敗しました。銘柄コードを確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 銘柄を削除
  const removeStock = (index: number) => {
    setPortfolio(prev => prev.filter((_, i) => i !== index));
  };

  // 総合統計を計算
  const calculatePortfolioStats = () => {
    const totalValue = portfolio.reduce((sum, stock) => 
      sum + ((stock.currentPrice || stock.buyPrice) * stock.shares), 0
    );
    
    const totalCost = portfolio.reduce((sum, stock) => 
      sum + (stock.buyPrice * stock.shares), 0
    );
    
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent
    };
  };

  const stats = calculatePortfolioStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* ポートフォリオサマリー */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">ポートフォリオトラッカー</h2>
            <Button
              onClick={updateCurrentPrices}
              disabled={isUpdating}
              variant="outline"
              size="sm"
            >
              {isUpdating ? '更新中...' : '価格更新'}
            </Button>
          </div>

          {portfolio.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">総資産価値</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">総投資金額</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>

              <div className={cn(
                "text-center p-4 rounded-lg",
                stats.totalGainLoss >= 0 ? "bg-green-50" : "bg-red-50"
              )}>
                {stats.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                )}
                <p className={cn(
                  "text-sm font-medium",
                  stats.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  損益
                </p>
                <p className={cn(
                  "text-2xl font-bold",
                  stats.totalGainLoss >= 0 ? "text-green-900" : "text-red-900"
                )}>
                  {formatCurrency(stats.totalGainLoss)}
                </p>
                <p className={cn(
                  "text-sm",
                  stats.totalGainLoss >= 0 ? "text-green-700" : "text-red-700"
                )}>
                  {formatPercent(stats.totalGainLossPercent)}
                </p>
              </div>
            </div>
          )}

          {/* 新しい銘柄を追加 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">銘柄を追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="銘柄コード (例: AAPL)"
                value={newStock.symbol}
                onChange={(e) => setNewStock(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              />
              <Input
                type="number"
                placeholder="株数"
                value={newStock.shares}
                onChange={(e) => setNewStock(prev => ({ ...prev, shares: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="購入価格 ($)"
                value={newStock.buyPrice}
                onChange={(e) => setNewStock(prev => ({ ...prev, buyPrice: e.target.value }))}
              />
              <Button
                onClick={addStock}
                disabled={isLoading || !newStock.symbol || !newStock.shares || !newStock.buyPrice}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {isLoading ? '追加中...' : '追加'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ポートフォリオリスト */}
      {portfolio.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">保有銘柄</h3>
            <div className="space-y-3">
              {portfolio.map((stock, index) => {
                const currentValue = (stock.currentPrice || stock.buyPrice) * stock.shares;
                const cost = stock.buyPrice * stock.shares;
                const gainLoss = currentValue - cost;
                const gainLossPercent = (gainLoss / cost) * 100;

                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold">{stock.symbol}</p>
                          <p className="text-sm text-gray-600">
                            {stock.shares} 株 @ {formatCurrency(stock.buyPrice)}
                          </p>
                        </div>
                        {stock.stockInfo && (
                          <Badge variant="outline">
                            {stock.stockInfo.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(currentValue)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "text-sm font-medium",
                          gainLoss >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(gainLoss)} ({formatPercent(gainLossPercent)})
                        </span>
                        <Button
                          onClick={() => removeStock(index)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {portfolio.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">ポートフォリオが空です</h3>
            <p className="text-gray-600 mb-6">
              上記のフォームから銘柄を追加してポートフォリオの追跡を開始しましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};