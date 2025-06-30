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
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Stock Advisor AI</h1>
          <p className="text-gray-600 mt-2">
            AIが株式を分析し、投資アドバイスを提供します
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 検索セクション */}
        <div className="mb-8">
          <StockSearch onSelectStock={handleSelectStock} />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>データを取得中...</span>
          </div>
        )}

        {/* 株式データ表示 */}
        {selectedSymbol && !isLoading && (
          <div className="space-y-6">
            {/* 株式情報とチャート */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stockInfo && <StockInfo stockInfo={stockInfo} />}
              {priceHistory && <StockChart priceHistory={priceHistory} />}
            </div>

            {/* テクニカル指標とAI分析 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {technicalIndicators && (
                <TechnicalIndicators indicators={technicalIndicators} />
              )}
              {stockAnalysis && <StockAnalysis analysis={stockAnalysis} />}
            </div>
          </div>
        )}

        {/* 初期状態のメッセージ */}
        {!selectedSymbol && !isLoading && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              銘柄を検索してください
            </h2>
            <p className="text-gray-500">
              アメリカ株、ETF、世界株式の分析を開始するには、
              <br />
              上記の検索ボックスに銘柄コードまたは企業名を入力してください
            </p>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p className="text-sm">
            ※ 本情報は投資勧誘を目的とするものではありません。
            最終的な投資判断はご自身の責任で行ってください。
          </p>
        </div>
      </footer>
    </div>
  );
}
