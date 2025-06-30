'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, ShieldAlert, Zap, Info } from 'lucide-react';
import { StockAnalysis as StockAnalysisType } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockAnalysisProps {
  analysis: StockAnalysisType;
}

export const StockAnalysis: React.FC<StockAnalysisProps> = ({ analysis }) => {
  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return {
          bg: 'bg-gradient-to-br from-emerald-500 to-green-600',
          border: 'border-emerald-200',
          text: 'text-white',
          icon: TrendingUp,
          label: '買い推奨',
          description: '上昇トレンド期待'
        };
      case 'SELL':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-rose-600',
          border: 'border-red-200',
          text: 'text-white',
          icon: TrendingDown,
          label: '売り推奨',
          description: '下降リスク警戒'
        };
      case 'HOLD':
        return {
          bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
          border: 'border-amber-200',
          text: 'text-white',
          icon: Minus,
          label: '保有推奨',
          description: '様子見が最適'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
          border: 'border-gray-200',
          text: 'text-white',
          icon: Info,
          label: '分析中',
          description: 'データ処理中'
        };
    }
  };

  const recommendationStyle = getRecommendationStyle(analysis.analysis.recommendation);
  const RecommendationIcon = recommendationStyle.icon;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const confidencePercentage = Math.round(analysis.analysis.confidence * 100);

  return (
    <div className="space-y-6">
      {/* メイン推奨カード */}
      <Card className={cn("overflow-hidden", recommendationStyle.border)}>
        <div className={cn("p-6", recommendationStyle.bg)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <RecommendationIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className={cn("text-xl font-bold", recommendationStyle.text)}>
                  {recommendationStyle.label}
                </h3>
                <p className={cn("text-sm opacity-90", recommendationStyle.text)}>
                  {recommendationStyle.description}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="h-3 w-3 mr-1" />
              信頼度 {confidencePercentage}%
            </Badge>
          </div>
          
          {/* 信頼度バー */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 価格目標 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">目標価格</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(analysis.analysis.target_price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">損切りライン</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(analysis.analysis.stop_loss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分析理由 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-lg">分析サマリー</h4>
          </div>
          
          <div className="space-y-3">
            {analysis.analysis.reasoning.map((reason, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1" />
              更新: {formatDate(analysis.timestamp)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};