'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Server, Database, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface APIStatusProps {
  className?: string;
}

interface BackendStatus {
  status: string;
  message: string;
  version: string;
  data_sources: string[];
  timestamp: string;
}

interface HealthStatus {
  status: string;
  service: string;
}

export const APIStatus: React.FC<APIStatusProps> = ({ className }) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const checkAPIStatus = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // ルートエンドポイントをチェック
      const rootResponse = await fetch('https://stock-backend-production-4ff1.up.railway.app/');
      const rootData = await rootResponse.json();
      setBackendStatus(rootData);
      
      // ヘルスチェックエンドポイント
      const healthResponse = await fetch('https://stock-backend-production-4ff1.up.railway.app/api/health');
      const healthData = await healthResponse.json();
      setHealthStatus(healthData);
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setLastCheck(new Date());
    } catch (error) {
      console.error('API status check failed:', error);
      setBackendStatus(null);
      setHealthStatus(null);
      setResponseTime(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAPIStatus();
    
    // 5分ごとに自動チェック
    const interval = setInterval(checkAPIStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string | null) => {
    if (!status) return 'text-gray-500';
    if (status === 'running' || status === 'ok') return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return <AlertCircle className="h-5 w-5 text-gray-500" />;
    if (status === 'running' || status === 'ok') return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const formatResponseTime = (time: number | null) => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatLastCheck = (date: Date | null) => {
    if (!date) return 'まだチェックされていません';
    return date.toLocaleString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">API接続状態</h2>
            <Button
              onClick={checkAPIStatus}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              {isLoading ? 'チェック中...' : '再チェック'}
            </Button>
          </div>

          {/* メインステータス */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* バックエンドステータス */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Server className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">バックエンドサーバー</h3>
              </div>
              
              {backendStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(backendStatus.status)}
                    <span className={cn("font-medium", getStatusColor(backendStatus.status))}>
                      {backendStatus.status === 'running' ? '稼働中' : backendStatus.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>バージョン: {backendStatus.version}</p>
                    <p>メッセージ: {backendStatus.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500">接続できません</span>
                </div>
              )}
            </div>

            {/* ヘルスチェック */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">ヘルスチェック</h3>
              </div>
              
              {healthStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(healthStatus.status)}
                    <span className={cn("font-medium", getStatusColor(healthStatus.status))}>
                      {healthStatus.status === 'ok' ? '正常' : healthStatus.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>サービス: {healthStatus.service}</p>
                    <p>レスポンス時間: {formatResponseTime(responseTime)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500">チェック失敗</span>
                </div>
              )}
            </div>
          </div>

          {/* データソース */}
          {backendStatus?.data_sources && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span>データソース</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {backendStatus.data_sources.map((source) => (
                  <Badge key={source} variant="secondary">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 接続情報 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">API URL:</p>
                <p className="font-mono text-xs">stock-backend-production-4ff1.up.railway.app</p>
              </div>
              <div>
                <p className="text-gray-600">最終チェック:</p>
                <p>{formatLastCheck(lastCheck)}</p>
              </div>
            </div>
          </div>

          {/* パフォーマンス指標 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">パフォーマンス</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {responseTime ? formatResponseTime(responseTime) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">レスポンス時間</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-gray-600">稼働率</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">v3.0.0</p>
                <p className="text-sm text-gray-600">APIバージョン</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};