/**
 * バックエンドAPIクライアント
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// APIクライアントのインスタンス作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 型定義
export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
}

export interface StockPriceHistory {
  symbol: string;
  dates: string[];
  prices: number[];
  volumes: number[];
}

export interface TechnicalIndicators {
  symbol: string;
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger_bands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  moving_averages?: {
    sma_20?: number;
    sma_50?: number;
    sma_200?: number;
  };
}

export interface StockAnalysis {
  symbol: string;
  analysis: {
    recommendation: 'BUY' | 'SELL' | 'HOLD' | 'ERROR';
    confidence: number;
    target_price: number;
    stop_loss: number;
    reasoning: string[];
  };
  timestamp: string;
}

// API関数
export const stockAPI = {
  // 株式銘柄を検索
  searchStocks: async (query: string): Promise<{ query: string; results: StockSearchResult[] }> => {
    const response = await apiClient.get('/api/stocks/search', {
      params: { query },
    });
    return response.data;
  },

  // 株式情報を取得
  getStockInfo: async (symbol: string): Promise<StockInfo> => {
    const response = await apiClient.get(`/api/stocks/${symbol}`);
    return response.data;
  },

  // 価格履歴を取得
  getPriceHistory: async (symbol: string, period: string = '1mo'): Promise<StockPriceHistory> => {
    const response = await apiClient.get(`/api/stocks/${symbol}/history`, {
      params: { period },
    });
    return response.data;
  },

  // テクニカル指標を取得
  getTechnicalIndicators: async (symbol: string): Promise<TechnicalIndicators> => {
    const response = await apiClient.get(`/api/stocks/${symbol}/indicators`);
    return response.data;
  },

  // 株式分析を取得
  getStockAnalysis: async (symbol: string): Promise<StockAnalysis> => {
    const response = await apiClient.get(`/api/stocks/${symbol}/analysis`);
    return response.data;
  },

  // ヘルスチェック
  checkHealth: async (): Promise<{ status: string; timestamp: string; service: string }> => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};