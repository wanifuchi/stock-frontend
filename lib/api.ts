/**
 * バックエンドAPIクライアント
 */
import axios from 'axios';

const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // プロトコルが指定されていない場合はhttpsを追加
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
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