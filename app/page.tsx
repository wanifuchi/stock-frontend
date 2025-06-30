'use client';

import React, { useState } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { StockInfo } from '@/components/StockInfo';
import { StockChart } from '@/components/StockChart';
import { TechnicalIndicators } from '@/components/TechnicalIndicators';
import { StockAnalysis } from '@/components/StockAnalysis';
import { AnalysisProgressIndicator } from '@/components/AnalysisProgressIndicator';
import { AIChat } from '@/components/AIChat';
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
  const [showProgressIndicator, setShowProgressIndicator] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');

  // デバッグ用：API URLを確認
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('API URL:', apiUrl);

  const handleSelectStock = async (symbol: string) => {
    // 全データを即座にクリア（再検索時の表示問題を防ぐ）
    setStockInfo(null);
    setPriceHistory(null);
    setTechnicalIndicators(null);
    setStockAnalysis(null);
    
    // 新しい銘柄を設定
    setSelectedSymbol(symbol);
    setShowProgressIndicator(true);
    setIsLoading(true);
    setError('');
    setAnalysisProgress(0);
    setCurrentAnalysisStep('fetch-data');

    try {
      // ステップ1: 基本情報を取得
      setCurrentAnalysisStep('fetch-data');
      const info = await stockAPI.getStockInfo(symbol);
      setStockInfo(info);
      setAnalysisProgress(25);
      
      // ステップ2: テクニカル分析
      setCurrentAnalysisStep('technical-analysis');
      const [history, indicators] = await Promise.all([
        stockAPI.getPriceHistory(symbol, '3mo'),
        stockAPI.getTechnicalIndicators(symbol),
      ]);
      
      setPriceHistory(history);
      setTechnicalIndicators(indicators);
      setAnalysisProgress(50);
      
      // ステップ3: AI分析実行
      setCurrentAnalysisStep('ai-analysis');
      setAnalysisProgress(75);
      
      // ステップ4: 最終分析結果を取得
      setCurrentAnalysisStep('generate-recommendation');
      const analysis = await stockAPI.getStockAnalysis(symbol);
      setStockAnalysis(analysis);
      setAnalysisProgress(100);
      
      // 完了後、短時間で非表示
      setTimeout(() => {
        setShowProgressIndicator(false);
      }, 300);
      
    } catch (err) {
      console.error('データ取得エラー:', err);
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました。';
      setError(`エラー: ${errorMessage} (API URL: ${apiUrl})`);
      setShowProgressIndicator(false);
      setAnalysisProgress(0);
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
                  インテリジェント投資分析
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <Brain className="h-3 w-3 mr-1" />
              AI搭載
            </Badge>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
              次世代の<span className="font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent gradient-text-fallback">投資分析</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              テクニカル指標、市場センチメント、機関投資家ロジックを組み合わせた高度なAI分析により、精密な売買推奨を提供します。
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

        {/* 高度な分析進行インジケータ */}
        {showProgressIndicator && (
          <div className="py-12">
            <AnalysisProgressIndicator 
              symbol={selectedSymbol}
              onComplete={() => setShowProgressIndicator(false)}
              externalProgress={analysisProgress}
              externalCurrentStep={currentAnalysisStep}
            />
          </div>
        )}

        {/* 中間結果の先行表示（インジケータ表示中でも部分結果を表示） */}
        {selectedSymbol && !isLoading && showProgressIndicator && (stockInfo || technicalIndicators) && (
          <div className="space-y-6 opacity-70">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                📊 分析中に取得済みデータを先行表示
              </p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {stockInfo && <StockInfo stockInfo={stockInfo} />}
              </div>
              <div className="space-y-6">
                {technicalIndicators && (
                  <TechnicalIndicators indicators={technicalIndicators} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* モダンな株式データ表示 */}
        {selectedSymbol && !isLoading && !showProgressIndicator && (
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
                分析の準備完了
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                上記に銘柄コードや企業名を入力して、AI搭載の投資分析を開始してください。
              </p>
            </div>
          </div>
        )}

        {/* AIチャット機能 */}
        {selectedSymbol && !isLoading && !showProgressIndicator && stockAnalysis && (
          <AIChat 
            stockSymbol={selectedSymbol}
            analysisData={{
              stockInfo,
              technicalIndicators,
              stockAnalysis
            }}
          />
        )}
      </main>

      {/* ミニマルなフッター */}
      <footer className="border-t border-border/50 mt-24">
        <div className="container max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              このプラットフォームは分析情報を提供するものであり、投資助言として解釈されるべきではありません。
              <br className="hidden sm:block" />
              投資判断を行う前に、ご自身で調査を行い、金融アドバイザーにご相談ください。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
