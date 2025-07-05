/**
 * バックエンドAPIクライアント
 */
import axios from 'axios';

const getApiBaseUrl = () => {
  // 新しいストック専用APIエンドポイントを使用
  return '/api/stock';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL); // デバッグログ

// APIクライアントのインスタンス作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60秒に延長（Alpha Vantageのレート制限対応）
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエスト/レスポンスインターセプターでデバッグログ
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

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
  advanced_trading?: {
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

export interface MarketData {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface TopMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// API関数
export const stockAPI = {
  // 株式銘柄を検索
  searchStocks: async (query: string): Promise<{ query: string; results: StockSearchResult[] }> => {
    const response = await apiClient.get('/search', {
      params: { query },
    });
    return response.data;
  },

  // 株式情報を取得
  getStockInfo: async (symbol: string): Promise<StockInfo> => {
    const response = await apiClient.get(`/stocks/${symbol}`);
    return response.data;
  },

  // 価格履歴を取得
  getPriceHistory: async (symbol: string, period: string = '1mo'): Promise<StockPriceHistory> => {
    const response = await apiClient.get(`/stocks/${symbol}/history`, {
      params: { period },
    });
    return response.data;
  },

  // テクニカル指標を取得
  getTechnicalIndicators: async (symbol: string): Promise<TechnicalIndicators> => {
    const response = await apiClient.get(`/stocks/${symbol}/indicators`);
    return response.data;
  },

  // 株式分析を取得
  getStockAnalysis: async (symbol: string): Promise<StockAnalysis> => {
    const response = await apiClient.get(`/stocks/${symbol}/analysis`);
    return response.data;
  },

  // ヘルスチェック
  checkHealth: async (): Promise<{ status: string; timestamp: string; service: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // 市場概況データを取得（主要指数）
  getMarketOverview: async (): Promise<MarketData[]> => {
    try {
      const response = await apiClient.get('/market-overview');
      return response.data;
    } catch (error) {
      console.error('市場概況データ取得エラー:', error);
      // フォールバック用のデモデータ
      return [
        { symbol: 'S&P 500', value: 4856.23, change: 23.45, changePercent: 0.48 },
        { symbol: 'NASDAQ', value: 15234.67, change: 89.12, changePercent: 0.59 },
        { symbol: 'DOW', value: 37543.89, change: -45.67, changePercent: -0.12 },
        { symbol: 'VIX', value: 12.34, change: -0.87, changePercent: -6.58 }
      ];
    }
  },

  // 注目銘柄（トップムーバー）を取得
  getTopMovers: async (): Promise<TopMover[]> => {
    try {
      const response = await apiClient.get('/top-movers');
      return response.data;
    } catch (error) {
      console.error('注目銘柄データ取得エラー:', error);
      // フォールバック用のデモデータ
      return [
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.43, change: 34.56, changePercent: 4.12 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 267.89, change: 12.34, changePercent: 4.84 },
        { symbol: 'AAPL', name: 'Apple Inc', price: 182.34, change: -2.45, changePercent: -1.33 },
        { symbol: 'META', name: 'Meta Platforms', price: 423.67, change: 8.90, changePercent: 2.14 }
      ];
    }
  },
};