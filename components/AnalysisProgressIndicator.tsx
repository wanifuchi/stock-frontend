'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, BarChart3, TrendingUp, Brain, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnalysisStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: number; // seconds
  status: 'pending' | 'running' | 'completed';
}

interface AnalysisProgressIndicatorProps {
  symbol: string;
  onComplete?: () => void;
  externalProgress?: number; // 外部から制御される進行状況（0-100）
  externalCurrentStep?: string; // 外部から制御される現在のステップID
}

export const AnalysisProgressIndicator: React.FC<AnalysisProgressIndicatorProps> = ({ 
  symbol, 
  onComplete,
  externalProgress,
  externalCurrentStep
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'fetch-data',
      label: '市場データ取得中',
      icon: BarChart3,
      estimatedTime: 3,
      status: 'running'
    },
    {
      id: 'technical-analysis',
      label: 'テクニカル指標計算中',
      icon: TrendingUp,
      estimatedTime: 5,
      status: 'pending'
    },
    {
      id: 'ai-analysis',
      label: 'AI分析実行中',
      icon: Brain,
      estimatedTime: 4,
      status: 'pending'
    },
    {
      id: 'generate-recommendation',
      label: '投資推奨生成中',
      icon: Zap,
      estimatedTime: 2,
      status: 'pending'
    }
  ]);

  // 総推定時間を計算
  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);

  // タイマー効果
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 外部進行状況に基づくステップ更新
  useEffect(() => {
    if (externalProgress !== undefined && externalCurrentStep) {
      const stepIndex = steps.findIndex(step => step.id === externalCurrentStep);
      if (stepIndex !== -1 && stepIndex !== currentStep) {
        setCurrentStep(stepIndex);
        
        // ステップ状態を更新
        setSteps(prev => prev.map((step, index) => {
          if (index < stepIndex) {
            return { ...step, status: 'completed' };
          } else if (index === stepIndex) {
            return { ...step, status: 'running' };
          } else {
            return { ...step, status: 'pending' };
          }
        }));
      }
      
      // 100%完了時
      if (externalProgress >= 100) {
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }
  }, [externalProgress, externalCurrentStep, steps, currentStep, onComplete]);

  // ステップ進行の自動化（外部制御がない場合のみ）
  useEffect(() => {
    if (externalProgress !== undefined) {
      return; // 外部制御の場合は自動進行しない
    }
    
    let stepTimer: NodeJS.Timeout;
    
    if (currentStep < steps.length) {
      const currentStepData = steps[currentStep];
      stepTimer = setTimeout(() => {
        // 現在のステップを完了
        setSteps(prev => prev.map((step, index) => {
          if (index === currentStep) {
            return { ...step, status: 'completed' };
          } else if (index === currentStep + 1) {
            return { ...step, status: 'running' };
          }
          return step;
        }));

        // 次のステップへ
        if (currentStep + 1 < steps.length) {
          setCurrentStep(currentStep + 1);
        } else {
          // 全ステップ完了
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }
      }, currentStepData.estimatedTime * 1000);
    }

    return () => {
      if (stepTimer) clearTimeout(stepTimer);
    };
  }, [currentStep, steps, onComplete, externalProgress]);

  // 進行状況のパーセンテージ計算（外部制御優先、100%を超えないよう制限）
  const progressPercentage = externalProgress !== undefined 
    ? Math.min(100, Math.max(0, externalProgress))
    : currentStep < steps.length 
      ? (currentStep / steps.length) * 100 + Math.min(1, (elapsedTime / (steps[currentStep]?.estimatedTime || 1))) * (100 / steps.length)
      : 100;

  // 残り時間の推定
  const remainingTime = Math.max(0, totalEstimatedTime - elapsedTime);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
            <h3 className="text-xl font-semibold">AI分析実行中</h3>
          </div>
          <p className="text-muted-foreground">
            {symbol}の包括的な投資分析を実施しています
          </p>
        </div>

        {/* 進行状況バー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">進行状況</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 時間情報 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">経過時間</p>
            <p className="font-semibold">{elapsedTime}秒</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">残り時間</p>
            <p className="font-semibold">約{remainingTime}秒</p>
          </div>
        </div>

        {/* ステップ一覧 */}
        <div className="space-y-3">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all duration-300",
                  step.status === 'completed' && "bg-green-50 border border-green-200",
                  step.status === 'running' && "bg-blue-50 border border-blue-200",
                  step.status === 'pending' && "bg-muted/20"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  step.status === 'completed' && "bg-green-500",
                  step.status === 'running' && "bg-blue-500",
                  step.status === 'pending' && "bg-muted"
                )}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <StepIcon className={cn(
                      "h-4 w-4",
                      step.status === 'running' ? "text-white animate-pulse" : "text-muted-foreground"
                    )} />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    step.status === 'completed' && "text-green-800",
                    step.status === 'running' && "text-blue-800",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                </div>
                
                <Badge 
                  variant={step.status === 'completed' ? 'default' : 'secondary'}
                  className={cn(
                    "text-xs",
                    step.status === 'completed' && "bg-green-500 text-white",
                    step.status === 'running' && "bg-blue-500 text-white animate-pulse"
                  )}
                >
                  {step.status === 'completed' ? '完了' : 
                   step.status === 'running' ? '実行中' : '待機中'}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* 詳細情報 */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            AI分析には高度な機械学習アルゴリズムを使用しています。<br />
            市場データ、テクニカル指標、センチメント分析を総合的に評価中...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};