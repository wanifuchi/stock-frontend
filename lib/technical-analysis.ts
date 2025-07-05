/**
 * テクニカル指標分析サービス
 * 株価データから各種テクニカル指標を計算し、取引シグナルを生成
 */

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  stochastic: {
    k: number;
    d: number;
  };
  williamsR: number;
  atr: number;
}

export interface TradingSignal {
  type: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  reason: string;
  strength: number;
  indicators: {
    rsi: { value: number; signal: 'BUY' | 'SELL' | 'NEUTRAL' };
    macd: { value: number; signal: 'BUY' | 'SELL' | 'NEUTRAL' };
    bollinger: { position: 'UPPER' | 'LOWER' | 'MIDDLE'; signal: 'BUY' | 'SELL' | 'NEUTRAL' };
    moving_average: { signal: 'BUY' | 'SELL' | 'NEUTRAL' };
    volume: { signal: 'HIGH' | 'LOW' | 'NORMAL' };
  };
}

export class TechnicalAnalysisService {
  /**
   * RSI (Relative Strength Index) を計算
   * 14期間のRSIを使用（30以下で過売り、70以上で過買い）
   */
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * MACD (Moving Average Convergence Divergence) を計算
   */
  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // MACDの9期間EMAがシグナル線
    const macdHistory = [macd]; // 実際は過去のMACD値が必要
    const signal = this.calculateEMA(macdHistory, 9);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  /**
   * EMA (Exponential Moving Average) を計算
   */
  static calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  /**
   * SMA (Simple Moving Average) を計算
   */
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const relevantPrices = prices.slice(-period);
    return relevantPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  /**
   * ボリンジャーバンドを計算
   */
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period);
    const relevantPrices = prices.slice(-period);
    
    const variance = relevantPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  /**
   * ストキャスティクスを計算
   */
  static calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14) {
    if (closes.length < period) return { k: 50, d: 50 };

    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1];

    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k; // 簡略化（実際は%Kの3期間移動平均）

    return { k, d };
  }

  /**
   * Williams %R を計算
   */
  static calculateWilliamsR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (closes.length < period) return -50;

    const recentHighs = highs.slice(-period);
    const recentLows = lows.slice(-period);
    const currentClose = closes[closes.length - 1];

    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);

    return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
  }

  /**
   * ATR (Average True Range) を計算
   */
  static calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (closes.length < 2) return 0;

    const trueRanges: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }

    return this.calculateSMA(trueRanges, period);
  }

  /**
   * すべてのテクニカル指標を計算
   */
  static calculateAllIndicators(priceData: PriceData[]): TechnicalIndicators {
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    // volumesは将来の拡張用に保持
    // const volumes = priceData.map(d => d.volume);

    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      bollingerBands: this.calculateBollingerBands(closes),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      ema12: this.calculateEMA(closes, 12),
      ema26: this.calculateEMA(closes, 26),
      stochastic: this.calculateStochastic(highs, lows, closes),
      williamsR: this.calculateWilliamsR(highs, lows, closes),
      atr: this.calculateATR(highs, lows, closes)
    };
  }

  /**
   * テクニカル指標からトレーディングシグナルを生成
   */
  static generateTradingSignal(symbol: string, priceData: PriceData[]): TradingSignal {
    const indicators = this.calculateAllIndicators(priceData);
    const currentPrice = priceData[priceData.length - 1].close;
    const avgVolume = priceData.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20;
    const currentVolume = priceData[priceData.length - 1].volume;

    // 各指標のシグナル判定
    const rsiSignal = indicators.rsi < 30 ? 'BUY' : indicators.rsi > 70 ? 'SELL' : 'NEUTRAL';
    const macdSignal = indicators.macd.macd > indicators.macd.signal ? 'BUY' : 'SELL';
    
    const bollingerPosition = currentPrice > indicators.bollingerBands.upper ? 'UPPER' :
                             currentPrice < indicators.bollingerBands.lower ? 'LOWER' : 'MIDDLE';
    const bollingerSignal = bollingerPosition === 'LOWER' ? 'BUY' : 
                           bollingerPosition === 'UPPER' ? 'SELL' : 'NEUTRAL';
    
    const movingAverageSignal = currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50 ? 'BUY' :
                               currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50 ? 'SELL' : 'NEUTRAL';
    
    const volumeSignal = currentVolume > avgVolume * 1.5 ? 'HIGH' :
                        currentVolume < avgVolume * 0.5 ? 'LOW' : 'NORMAL';

    // 総合判定
    const signals = [rsiSignal, macdSignal, bollingerSignal, movingAverageSignal];
    const buyCount = signals.filter(s => s === 'BUY').length;
    const sellCount = signals.filter(s => s === 'SELL').length;
    
    let overallSignal: 'BUY' | 'SELL' | 'HOLD';
    let confidence: number;
    let reason: string;
    let strength: number;

    if (buyCount > sellCount) {
      overallSignal = 'BUY';
      confidence = Math.min(90, 60 + (buyCount * 10));
      strength = buyCount * 25;
      reason = this.generateBuyReason(indicators, rsiSignal, macdSignal, bollingerSignal, movingAverageSignal);
    } else if (sellCount > buyCount) {
      overallSignal = 'SELL';
      confidence = Math.min(90, 60 + (sellCount * 10));
      strength = sellCount * 25;
      reason = this.generateSellReason(indicators, rsiSignal, macdSignal, bollingerSignal, movingAverageSignal);
    } else {
      overallSignal = 'HOLD';
      confidence = 50 + Math.random() * 20;
      strength = 50;
      reason = 'テクニカル指標が中立的な状況';
    }

    return {
      type: overallSignal,
      symbol,
      confidence: Math.round(confidence),
      reason,
      strength,
      indicators: {
        rsi: { value: Math.round(indicators.rsi), signal: rsiSignal },
        macd: { value: Number(indicators.macd.macd.toFixed(2)), signal: macdSignal },
        bollinger: { position: bollingerPosition, signal: bollingerSignal },
        moving_average: { signal: movingAverageSignal },
        volume: { signal: volumeSignal }
      }
    };
  }

  /**
   * 買いシグナルの理由を生成
   */
  private static generateBuyReason(indicators: TechnicalIndicators, rsi: string, macd: string, bollinger: string, ma: string): string {
    const reasons = [];
    
    if (rsi === 'BUY') reasons.push('RSI過売り圏から反発');
    if (macd === 'BUY') reasons.push('MACDゴールデンクロス');
    if (bollinger === 'BUY') reasons.push('ボリンジャーバンド下限反発');
    if (ma === 'BUY') reasons.push('移動平均上抜け');
    
    return reasons.length > 0 ? reasons.join('、') : 'テクニカル指標改善';
  }

  /**
   * 売りシグナルの理由を生成
   */
  private static generateSellReason(indicators: TechnicalIndicators, rsi: string, macd: string, bollinger: string, ma: string): string {
    const reasons = [];
    
    if (rsi === 'SELL') reasons.push('RSI過買い圏到達');
    if (macd === 'SELL') reasons.push('MACDデッドクロス');
    if (bollinger === 'SELL') reasons.push('ボリンジャーバンド上限到達');
    if (ma === 'SELL') reasons.push('移動平均下抜け');
    
    return reasons.length > 0 ? reasons.join('、') : 'テクニカル指標悪化';
  }
}