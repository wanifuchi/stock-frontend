'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Bell,
  Target,
  Clock,
  Zap,
  Settings,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Signal {
  id: string;
  type: 'BUY' | 'SELL' | 'HOLD' | 'WARNING';
  symbol: string;
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'TECHNICAL' | 'FUNDAMENTAL' | 'NEWS' | 'VOLUME';
}

interface SignalAlertProps {
  selectedSymbol?: string;
  realTimeMode?: boolean;
}

export const SignalAlert: React.FC<SignalAlertProps> = ({ 
  selectedSymbol,
  realTimeMode = true 
}) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'WARNING'>('ALL');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // デモシグナルデータ
  const demoSignals: Signal[] = [
    {
      id: '1',
      type: 'BUY',
      symbol: 'NVDA',
      title: 'ブレイクアウトシグナル',
      description: 'RSI 30を下回り、ボリューム急増。強い買いシグナル',
      confidence: 85,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'HIGH',
      category: 'TECHNICAL'
    },
    {
      id: '2',
      type: 'SELL',
      symbol: 'AAPL',
      title: '利確ゾーン到達',
      description: 'RSI 75超え、ボリンジャーバンド上限到達',
      confidence: 78,
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      priority: 'MEDIUM',
      category: 'TECHNICAL'
    },
    {
      id: '3',
      type: 'WARNING',
      symbol: 'TSLA',
      title: 'ボラティリティ警告',
      description: '異常な出来高増加とVIX上昇を検出',
      confidence: 92,
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      priority: 'HIGH',
      category: 'VOLUME'
    },
    {
      id: '4',
      type: 'BUY',
      symbol: 'MSFT',
      title: 'サポートライン反発',
      description: '200日移動平均線でサポート確認、反発期待',
      confidence: 72,
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      priority: 'MEDIUM',
      category: 'TECHNICAL'
    },
    {
      id: '5',
      type: 'HOLD',
      symbol: 'META',
      title: 'レンジ相場継続',
      description: '明確なトレンドなし、様子見推奨',
      confidence: 65,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      priority: 'LOW',
      category: 'TECHNICAL'
    }
  ];

  useEffect(() => {
    setSignals(demoSignals);
  }, []);

  // リアルタイム更新シミュレーション
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      // 30秒ごとに新しいシグナルを追加する可能性
      if (Math.random() < 0.3) {
        const newSignal: Signal = {
          id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: ['BUY', 'SELL', 'WARNING'][Math.floor(Math.random() * 3)] as any,
          symbol: ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'META'][Math.floor(Math.random() * 5)],
          title: 'リアルタイム シグナル',
          description: 'AI分析により新しいパターンを検出',
          confidence: Math.floor(Math.random() * 30) + 70,
          timestamp: new Date(),
          priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as any,
          category: 'TECHNICAL'
        };

        setSignals(prev => [newSignal, ...prev].slice(0, 10));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  const filteredSignals = signals.filter(signal => {
    if (filterType === 'ALL') return true;
    return signal.type === filterType;
  });

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'SELL': return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY': return 'border-green-200 bg-green-50';
      case 'SELL': return 'border-red-200 bg-red-50';
      case 'WARNING': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '今';
    if (diffMins < 60) return `${diffMins}分前`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${Math.floor(diffHours / 24)}日前`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            シグナルアラート
          </h2>
          <Badge variant={realTimeMode ? "default" : "secondary"} className="animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            {realTimeMode ? 'リアルタイム' : '静的'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNotificationEnabled(!isNotificationEnabled)}
          >
            <Bell className={cn("w-4 h-4 mr-2", isNotificationEnabled ? "text-blue-600" : "text-gray-400")} />
            通知
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            設定
          </Button>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-blue-600">{signals.length}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">買いシグナル</p>
                <p className="text-2xl font-bold text-green-600">
                  {signals.filter(s => s.type === 'BUY').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">売りシグナル</p>
                <p className="text-2xl font-bold text-red-600">
                  {signals.filter(s => s.type === 'SELL').length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">警告</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {signals.filter(s => s.type === 'WARNING').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">フィルター:</span>
        {['ALL', 'BUY', 'SELL', 'WARNING'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type as any)}
          >
            {type === 'ALL' ? 'すべて' : type}
          </Button>
        ))}
      </div>

      {/* シグナル一覧 */}
      <div className="space-y-3">
        {filteredSignals.map((signal) => (
          <Card key={signal.id} className={cn("border-l-4", getSignalColor(signal.type))}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getSignalIcon(signal.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {signal.symbol}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {signal.category}
                      </Badge>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        getPriorityColor(signal.priority)
                      )} />
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                      {signal.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {signal.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(signal.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>信頼度 {signal.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={signal.type === 'BUY' ? 'default' : signal.type === 'SELL' ? 'destructive' : 'secondary'}>
                    {signal.type}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {signal.priority}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSignals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              シグナルがありません
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              現在、選択したフィルターに該当するシグナルはありません
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};