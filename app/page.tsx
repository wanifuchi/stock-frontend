'use client';

import React, { useState } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { StockInfo } from '@/components/StockInfo';
import { StockChart } from '@/components/StockChart';
import { TechnicalIndicators } from '@/components/TechnicalIndicators';
import { StockAnalysis } from '@/components/StockAnalysis';
import { 
  stockAPI, 
  StockInfo as StockInfoType, 
  StockPriceHistory as StockPriceHistoryType, 
  TechnicalIndicators as TechnicalIndicatorsType, 
  StockAnalysis as StockAnalysisType 
} from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Brain } from 'lucide-react';

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [stockInfo, setStockInfo] = useState<StockInfoType | null>(null);
  const [priceHistory, setPriceHistory] = useState<StockPriceHistoryType | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicatorsType | null>(null);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // デバッグ用：API URLを確認
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('API URL:', apiUrl);

  const handleSelectStock = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsLoading(true);
    setError('');

    try {
      // Alpha Vantageのレート制限を考慮して順次実行
      // まず基本情報を取得
      const info = await stockAPI.getStockInfo(symbol);
      setStockInfo(info);
      
      // 価格履歴とテクニカル指標を並行取得
      const [history, indicators] = await Promise.all([
        stockAPI.getPriceHistory(symbol, '3mo'),
        stockAPI.getTechnicalIndicators(symbol),
      ]);
      
      setPriceHistory(history);
      setTechnicalIndicators(indicators);
      
      // 最後に分析を取得（他のデータが揃ってから）
      const analysis = await stockAPI.getStockAnalysis(symbol);
      setStockAnalysis(analysis);
    } catch (err) {
      console.error('データ取得エラー:', err);
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました。';
      setError(`エラー: ${errorMessage} (API URL: ${apiUrl})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ミニマルなヘッダー */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Stock Advisor</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Intelligent investment analysis
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
              Make informed
              <span className="block font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                investment decisions
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Advanced AI analysis combining technical indicators, market sentiment, and institutional investor logic to provide precise buy and sell recommendations.
            </p>
            
            {/* エレガントな検索 */}
            <div className="max-w-md mx-auto">
              <StockSearch onSelectStock={handleSelectStock} />
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <main className="container max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* エラー表示 */}
        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-destructive"></div>
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* エレガントなローディング */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-muted"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground font-medium">
              Analyzing market data...
            </p>
          </div>
        )}

        {/* モダンな株式データ表示 */}
        {selectedSymbol && !isLoading && (
          <div className="space-y-8">
            {/* グリッドレイアウト - デスクトップで最適化 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* メイン情報 - より大きなスペース */}
              <div className="xl:col-span-2 space-y-6">
                {stockInfo && <StockInfo stockInfo={stockInfo} />}
                {priceHistory && <StockChart priceHistory={priceHistory} />}
              </div>

              {/* サイドパネル - 分析とテクニカル */}
              <div className="space-y-6">
                {stockAnalysis && <StockAnalysis analysis={stockAnalysis} />}
                {technicalIndicators && (
                  <TechnicalIndicators indicators={technicalIndicators} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* 美しい空状態 */}
        {!selectedSymbol && !isLoading && (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-light tracking-tight mb-3">
                Ready to analyze
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Enter a stock symbol or company name above to get started with our AI-powered investment analysis.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ミニマルなフッター */}
      <footer className="border-t border-border/50 mt-24">
        <div className="container max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              This platform provides analytical insights and should not be considered as investment advice.
              <br className="hidden sm:block" />
              Please conduct your own research and consult with financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
