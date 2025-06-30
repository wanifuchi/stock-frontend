'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Building2, Activity, DollarSign } from 'lucide-react';
import { StockInfo as StockInfoType } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockInfoProps {
  stockInfo: StockInfoType;
}

export const StockInfo: React.FC<StockInfoProps> = ({ stockInfo }) => {
  const isPositive = stockInfo.change >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const changeBg = isPositive ? 'bg-emerald-50' : 'bg-red-50';
  const changeBorder = isPositive ? 'border-emerald-200' : 'border-red-200';
  const changeIcon = isPositive ? TrendingUp : TrendingDown;
  const ChangeIcon = changeIcon;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1_000_000_000_000) {
      return `${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
    } else if (marketCap >= 1_000_000_000) {
      return `${(marketCap / 1_000_000_000).toFixed(1)}B`;
    } else if (marketCap >= 1_000_000) {
      return `${(marketCap / 1_000_000).toFixed(1)}M`;
    }
    return formatCurrency(marketCap);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* ヘッダーセクション */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{stockInfo.symbol}</h2>
                <p className="text-muted-foreground text-sm font-medium">{stockInfo.name}</p>
              </div>
            </div>
            
            {/* 価格変動バッジ */}
            <Badge 
              className={cn(
                "px-3 py-1 text-sm font-semibold",
                changeBg,
                changeBorder,
                changeColor,
                "border"
              )}
            >
              <ChangeIcon className="h-4 w-4 mr-1" />
              {isPositive && '+'}
              {stockInfo.change_percent.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* 価格セクション */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold tracking-tight">
                {formatCurrency(stockInfo.current_price)}
              </span>
              <div className={cn("flex items-center space-x-1", changeColor)}>
                <ChangeIcon className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {isPositive && '+'}
                  {formatCurrency(stockInfo.change)}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              現在価格（リアルタイム）
            </p>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 出来高 */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">出来高</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatNumber(stockInfo.volume)}
                </p>
              </div>
            </div>

            {/* 時価総額 */}
            {stockInfo.market_cap && (
              <div className="flex items-center space-x-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">時価総額</p>
                  <p className="text-xl font-bold text-purple-900">
                    ${formatMarketCap(stockInfo.market_cap)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* パフォーマンス可視化 */}
          <div className="mt-6 p-4 bg-muted/20 rounded-xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">日中パフォーマンス</span>
              <span className={cn("font-semibold", changeColor)}>
                {isPositive ? '上昇' : '下落'} {Math.abs(stockInfo.change_percent).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  isPositive ? "bg-emerald-500" : "bg-red-500"
                )}
                style={{ 
                  width: `${Math.min(Math.abs(stockInfo.change_percent) * 10, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};