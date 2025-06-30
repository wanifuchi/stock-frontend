'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, AlertCircle, Target, Shield, 
  DollarSign, Activity, BarChart3, Zap, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradingSignalsProps {
  tradingData?: {
    market_environment?: {
      type: string;
      direction: string;
      adx: number;
      strength: number;
    };
    trading_signals?: {
      primary_signal: string;
      confidence: number;
      entry_signals: Array<{
        type: string;
        reason: string;
        strength: number;
      }>;
      exit_signals: Array<{
        type: string;
        reason: string;
        strength: number;
      }>;
    };
    risk_reward_targets?: {
      entry_price: number;
      stop_loss: number;
      take_profit_1: number;
      take_profit_2: number;
      take_profit_3: number;
      risk_reward_ratio: number;
      position_size_suggestion: number;
    };
    support_resistance?: {
      nearest_support: number | null;
      nearest_resistance: number | null;
      pivot_points: {
        pivot: number;
        r1: number;
        s1: number;
      };
    };
    action_plan?: string[];
  };
}

export const TradingSignals: React.FC<TradingSignalsProps> = ({ tradingData }) => {
  if (!tradingData) return null;

  const { 
    market_environment, 
    trading_signals, 
    risk_reward_targets, 
    support_resistance,
    action_plan 
  } = tradingData;

  // シグナルの色分け
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-600 bg-green-50 border-green-200';
      case 'SELL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* 市場環境分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            市場環境分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">市場タイプ</p>
              <Badge variant="outline" className="text-lg">
                {market_environment?.type === 'trending' ? 'トレンド相場' : 'レンジ相場'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">トレンド方向</p>
              <div className="flex items-center gap-2">
                {market_environment?.direction === 'bullish' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : market_environment?.direction === 'bearish' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                )}
                <span className="font-medium">
                  {market_environment?.direction === 'bullish' ? '上昇' : 
                   market_environment?.direction === 'bearish' ? '下降' : '中立'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">ADX（トレンド強度）</p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{market_environment?.adx}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${market_environment?.strength ? market_environment.strength * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 売買シグナル */}
      <Card className={cn(
        "border-2",
        trading_signals?.primary_signal === 'BUY' ? 'border-green-500' :
        trading_signals?.primary_signal === 'SELL' ? 'border-red-500' : 'border-gray-300'
      )}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              売買シグナル
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-lg px-4 py-1", getSignalColor(trading_signals?.primary_signal || 'HOLD'))}
            >
              {trading_signals?.primary_signal}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 信頼度 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">シグナル信頼度</span>
              <span className="font-medium">{((trading_signals?.confidence || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-300", getConfidenceColor(trading_signals?.confidence || 0))}
                style={{ width: `${(trading_signals?.confidence || 0) * 100}%` }}
              />
            </div>
          </div>

          {/* エントリーシグナル */}
          {trading_signals?.entry_signals && trading_signals.entry_signals.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-green-700">買いシグナル</p>
              <div className="space-y-2">
                {trading_signals.entry_signals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-medium">{signal.reason}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        強度: {(signal.strength * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* エグジットシグナル */}
          {trading_signals?.exit_signals && trading_signals.exit_signals.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-red-700">売りシグナル</p>
              <div className="space-y-2">
                {trading_signals.exit_signals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-medium">{signal.reason}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        強度: {(signal.strength * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* リスク・リワード分析 */}
      {risk_reward_targets && trading_signals?.primary_signal !== 'HOLD' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              価格目標とリスク管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 価格レベル */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">エントリー価格</p>
                    <p className="text-xl font-bold">${risk_reward_targets.entry_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      損切りライン
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      ${risk_reward_targets.stop_loss}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">利益目標</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-green-600 font-medium">T1:</span> ${risk_reward_targets.take_profit_1}
                      </p>
                      <p className="text-sm">
                        <span className="text-green-600 font-medium">T2:</span> ${risk_reward_targets.take_profit_2}
                      </p>
                      <p className="text-sm">
                        <span className="text-green-600 font-medium">T3:</span> ${risk_reward_targets.take_profit_3}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* リスク・リワード比 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">リスク・リワード比</span>
                  <Badge 
                    variant={risk_reward_targets.risk_reward_ratio >= 2 ? 'default' : 'secondary'}
                    className="text-lg"
                  >
                    1:{risk_reward_targets.risk_reward_ratio}
                  </Badge>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">推奨ポジションサイズ</span>
                  <p className="text-lg font-medium">
                    {(risk_reward_targets.position_size_suggestion * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 支持線・抵抗線 */}
      {support_resistance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              支持線・抵抗線
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">サポートレベル</p>
                {support_resistance.nearest_support && (
                  <p className="text-lg font-medium text-green-600">
                    ${support_resistance.nearest_support}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  S1: ${support_resistance.pivot_points?.s1}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">レジスタンスレベル</p>
                {support_resistance.nearest_resistance && (
                  <p className="text-lg font-medium text-red-600">
                    ${support_resistance.nearest_resistance}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  R1: ${support_resistance.pivot_points?.r1}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">ピボットポイント</p>
              <p className="text-lg font-medium">${support_resistance.pivot_points?.pivot}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* アクションプラン */}
      {action_plan && action_plan.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              実行アクションプラン
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {action_plan.map((action, index) => (
                <div key={index} className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};