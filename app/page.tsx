'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { StockSearch } from '@/components/StockSearch';
import { StockChart } from '@/components/StockChart';
import { TechnicalAnalysis } from '@/components/TechnicalAnalysis';
import { StockInfo } from '@/components/StockInfo';
import { AIChat } from '@/components/AIChat';
import { TradingSignals } from '@/components/TradingSignals';
import { AnalysisProgressIndicator } from '@/components/AnalysisProgressIndicator';
import { SignalAlert } from '@/components/SignalAlert';
import { StockAnalysis } from '@/components/StockAnalysis';
import { TechnicalIndicators } from '@/components/TechnicalIndicators';
import { 
  stockAPI, 
  StockInfo as StockInfoType, 
  StockPriceHistory as StockPriceHistoryType, 
  TechnicalIndicators as TechnicalIndicatorsType, 
  StockAnalysis as StockAnalysisType 
} from '@/lib/api';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [stockData, setStockData] = useState<any>(null);
  const [technicalData, setTechnicalData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showProgress, setShowProgress] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // 従来の型付きstate（既存コンポーネント互換性用）
  const [stockInfo, setStockInfo] = useState<StockInfoType | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicatorsType | null>(null);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysisType | null>(null);

  // テーマ切り替え
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 銘柄検索・選択ハンドラー
  const handleSearchSelect = async (symbol: string) => {
    // すべてのデータをクリア
    setStockData(null);
    setStockInfo(null);
    setTechnicalData(null);
    setTechnicalIndicators(null);
    setAnalysisData(null);
    setStockAnalysis(null);
    setPriceHistory(null);
    setError('');
    setSelectedSymbol(symbol);
    setShowProgress(true);
    setIsLoading(true);
    setAnalysisProgress(0);
    setCurrentStep('fetch-data');
    
    try {
      // ステップ1: 基本情報を取得
      setCurrentStep('fetch-data');
      const info = await stockAPI.getStockInfo(symbol);
      setStockData(info);
      setStockInfo(info);
      setAnalysisProgress(25);
      
      // ステップ2: テクニカル分析と価格履歴を並行取得
      setCurrentStep('technical-analysis');
      const [history, indicators] = await Promise.all([
        stockAPI.getPriceHistory(symbol, '3mo'),
        stockAPI.getTechnicalIndicators(symbol)
      ]);
      
      setPriceHistory(history);
      setTechnicalData(indicators);
      setTechnicalIndicators(indicators);
      setAnalysisProgress(50);
      
      // ステップ3: AI分析実行
      setCurrentStep('ai-analysis');
      setAnalysisProgress(75);
      
      // ステップ4: 最終分析結果を取得
      setCurrentStep('generate-recommendation');
      const analysis = await stockAPI.getStockAnalysis(symbol);
      setAnalysisData(analysis);
      setStockAnalysis(analysis);
      setAnalysisProgress(100);
      
      // 完了後、短時間で非表示
      setTimeout(() => {
        setShowProgress(false);
        // ダッシュボードセクションに自動切り替え
        if (activeSection !== 'dashboard') {
          setActiveSection('dashboard');
        }
      }, 500);
      
    } catch (err) {
      console.error('株式データ取得エラー:', err);
      setError(`${symbol} の情報を取得できませんでした`);
      setShowProgress(false);
      setAnalysisProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // セクション別のコンテンツをレンダリング
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Dashboard 
              selectedSymbol={selectedSymbol}
              stockData={stockData}
              technicalData={technicalData}
              analysisData={analysisData}
            />
            {selectedSymbol && stockData && stockInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <StockInfo stockInfo={stockInfo} />
                </div>
                <div className="space-y-4">
                  {analysisData?.advanced_trading && (
                    <TradingSignals tradingData={analysisData.advanced_trading} />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'search':
        return (
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                銘柄検索
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                銘柄コードまたは企業名で検索して詳細分析を開始
              </p>
            </div>
            <StockSearch 
              onSelectStock={handleSearchSelect}
              className="mb-8"
              placeholder="例: AAPL, NVDA, Tesla..."
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        );
      
      case 'charts':
        return selectedSymbol && stockData ? (
          <div className="space-y-6">
            <StockChart 
              priceHistory={priceHistory}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              価格チャート
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              銘柄を選択して詳細チャートを表示
            </p>
            <StockSearch 
              onSelectStock={handleSearchSelect}
              className="max-w-md mx-auto"
            />
          </div>
        );
      
      case 'technical':
        return selectedSymbol && stockData ? (
          <TechnicalAnalysis 
            symbol={selectedSymbol}
            indicators={technicalData}
            currentPrice={stockData.current_price}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              テクニカル分析
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              銘柄を選択してテクニカル分析を開始
            </p>
            <StockSearch 
              onSelectStock={handleSearchSelect}
              className="max-w-md mx-auto"
            />
          </div>
        );
      
      case 'signals':
        return (
          <SignalAlert selectedSymbol={selectedSymbol} />
        );
      
      case 'ai-chat':
        return selectedSymbol && stockData ? (
          <AIChat
            stockSymbol={selectedSymbol}
            analysisData={{
              stockInfo: stockData,
              technicalIndicators: technicalData,
              stockAnalysis: analysisData
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              AI投資アドバイザー
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              銘柄を選択してAIアドバイザーに相談
            </p>
            <StockSearch 
              onSelectStock={handleSearchSelect}
              className="max-w-md mx-auto"
            />
          </div>
        );

      // 従来のレイアウトも保持（従来のコンポーネント使用）
      case 'legacy':
        return (
          <div className="space-y-8">
            {/* 既存のエレガントなレイアウト */}
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
                次世代の<span className="font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent gradient-text-fallback">投資分析</span>
              </h2>
              <div className="max-w-md mx-auto mb-8">
                <StockSearch onSelectStock={handleSearchSelect} />
              </div>
            </div>

            {/* 分析進行インジケータ */}
            {showProgress && (
              <div className="py-12">
                <AnalysisProgressIndicator 
                  symbol={selectedSymbol}
                  onComplete={() => setShowProgress(false)}
                  externalProgress={analysisProgress}
                  externalCurrentStep={currentStep}
                />
              </div>
            )}

            {/* データ表示 */}
            {selectedSymbol && !isLoading && !showProgress && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    {stockInfo && <StockInfo stockInfo={stockInfo} />}
                    {priceHistory && <StockChart priceHistory={priceHistory} />}
                  </div>
                  <div className="space-y-6">
                    {stockAnalysis && <StockAnalysis analysis={stockAnalysis} />}
                    {technicalIndicators && (
                      <TechnicalIndicators indicators={technicalIndicators} symbol={selectedSymbol} />
                    )}
                  </div>
                </div>
                {stockAnalysis?.advanced_trading && (
                  <TradingSignals tradingData={stockAnalysis.advanced_trading} />
                )}
              </div>
            )}

            {/* AIチャット */}
            {selectedSymbol && !isLoading && !showProgress && stockAnalysis && (
              <AIChat 
                stockSymbol={selectedSymbol}
                analysisData={{
                  stockInfo,
                  technicalIndicators,
                  stockAnalysis
                }}
              />
            )}
          </div>
        );
      
      default:
        return (
          <Dashboard 
            selectedSymbol={selectedSymbol}
            stockData={stockData}
            technicalData={technicalData}
            analysisData={analysisData}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* サイドバー */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <Header 
          onSearch={handleSearchSelect}
          onToggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          notifications={3}
        />
        
        {/* メインコンテンツエリア */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* プログレスインジケーター */}
          {showProgress && (
            <div className="py-12">
              <AnalysisProgressIndicator 
                symbol={selectedSymbol}
                onComplete={() => setShowProgress(false)}
                externalProgress={analysisProgress}
                externalCurrentStep={currentStep}
              />
            </div>
          )}
          
          {/* エラー表示 */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* メインコンテンツ */}
          {!showProgress && !isLoading && renderContent()}
        </main>
      </div>
    </div>
  );
}