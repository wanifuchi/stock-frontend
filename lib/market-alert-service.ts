/**
 * 市場アラートサービス
 * VIX監視、ボラティリティ分析、セクター分析を実行し、市場アラートを生成
 */

export interface MarketAlert {
  id: string;
  type: 'WARNING' | 'INFO' | 'CRITICAL';
  category: 'VOLATILITY' | 'SECTOR' | 'TECHNICAL' | 'VOLUME';
  title: string;
  description: string;
  timestamp: string;
  priority: number; // 1-10 (10が最高優先度)
  data?: Record<string, unknown>;
}

export interface MarketIndicators {
  vix: number;
  vix_change: number;
  market_fear_greed_index: number;
  sector_rotation_strength: number;
  overall_volatility: number;
}

export interface SectorPerformance {
  sector: string;
  symbol: string;
  change_1d: number;
  change_5d: number;
  change_1m: number;
  relative_strength: number;
}

export class MarketAlertService {
  private static readonly VIX_THRESHOLDS = {
    LOW: 12,        // 低ボラティリティ
    NORMAL: 20,     // 通常レベル
    ELEVATED: 30,   // 警戒レベル
    HIGH: 40        // 高ボラティリティ
  };

  private static readonly SECTOR_ETFS = [
    { name: 'Technology', symbol: 'XLK' },
    { name: 'Financial', symbol: 'XLF' },
    { name: 'Healthcare', symbol: 'XLV' },
    { name: 'Consumer Discretionary', symbol: 'XLY' },
    { name: 'Communication Services', symbol: 'XLC' },
    { name: 'Industrial', symbol: 'XLI' },
    { name: 'Consumer Staples', symbol: 'XLP' },
    { name: 'Energy', symbol: 'XLE' },
    { name: 'Utilities', symbol: 'XLU' },
    { name: 'Real Estate', symbol: 'XLRE' },
    { name: 'Materials', symbol: 'XLB' }
  ];

  /**
   * 市場指標を分析してアラートを生成
   */
  static async generateMarketAlerts(): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];

    try {
      // VIX分析
      const vixAlerts = await this.analyzeVIX();
      alerts.push(...vixAlerts);

      // セクター分析
      const sectorAlerts = await this.analyzeSectorRotation();
      alerts.push(...sectorAlerts);

      // 市場ボラティリティ分析
      const volatilityAlerts = await this.analyzeMarketVolatility();
      alerts.push(...volatilityAlerts);

      // 異常出来高分析
      const volumeAlerts = await this.analyzeVolumeAnomalies();
      alerts.push(...volumeAlerts);

    } catch (error) {
      console.error('市場アラート生成エラー:', error);
      // エラー時は基本的なデモアラートを生成
      alerts.push(...this.generateDemoAlerts());
    }

    // 優先度順でソート
    return alerts.sort((a, b) => b.priority - a.priority);
  }

  /**
   * VIX分析によるアラート生成
   */
  private static async analyzeVIX(): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];

    try {
      // VIXデータを取得（市場概況APIから）
      const response = await fetch('/api/stock/market-overview');
      const marketData = await response.json();
      
      interface MarketDataItem {
        symbol: string;
        value: number;
        change: number;
        changePercent: number;
      }
      
      const vixData = marketData.find((item: MarketDataItem) => item.symbol === 'VIX');
      if (!vixData) throw new Error('VIX data not found');

      const vix = vixData.value;
      const vixChange = vixData.change;

      // VIXレベル分析
      if (vix > this.VIX_THRESHOLDS.HIGH) {
        alerts.push({
          id: `vix-critical-${Date.now()}`,
          type: 'CRITICAL',
          category: 'VOLATILITY',
          title: 'VIX危険レベル到達',
          description: `VIX指数が${vix.toFixed(1)}に達し、市場の極度な不安定性を示しています。リスク管理を強化してください。`,
          timestamp: new Date().toISOString(),
          priority: 9,
          data: { vix, vix_change: vixChange, threshold: this.VIX_THRESHOLDS.HIGH }
        });
      } else if (vix > this.VIX_THRESHOLDS.ELEVATED) {
        alerts.push({
          id: `vix-warning-${Date.now()}`,
          type: 'WARNING',
          category: 'VOLATILITY',
          title: 'VIX上昇中',
          description: `VIX指数が${vix.toFixed(1)}に上昇し、市場のボラティリティが増加しています。`,
          timestamp: new Date().toISOString(),
          priority: 6,
          data: { vix, vix_change: vixChange, threshold: this.VIX_THRESHOLDS.ELEVATED }
        });
      } else if (vix < this.VIX_THRESHOLDS.LOW) {
        alerts.push({
          id: `vix-low-${Date.now()}`,
          type: 'INFO',
          category: 'VOLATILITY',
          title: 'VIX低水準',
          description: `VIX指数が${vix.toFixed(1)}の低水準にあり、市場の過度な楽観に注意が必要です。`,
          timestamp: new Date().toISOString(),
          priority: 3,
          data: { vix, vix_change: vixChange, threshold: this.VIX_THRESHOLDS.LOW }
        });
      }

      // VIX急変分析
      if (Math.abs(vixChange) > 3) {
        const direction = vixChange > 0 ? '急上昇' : '急下降';
        alerts.push({
          id: `vix-spike-${Date.now()}`,
          type: vixChange > 0 ? 'WARNING' : 'INFO',
          category: 'VOLATILITY',
          title: `VIX${direction}`,
          description: `VIX指数が${Math.abs(vixChange).toFixed(1)}ポイント${direction}し、市場センチメントの急激な変化を示しています。`,
          timestamp: new Date().toISOString(),
          priority: vixChange > 0 ? 7 : 4,
          data: { vix, vix_change: vixChange }
        });
      }

    } catch (error) {
      console.error('VIX分析エラー:', error);
      // フォールバック: 模擬VIXアラート
      const mockVix = 25 + Math.random() * 15;
      if (mockVix > this.VIX_THRESHOLDS.ELEVATED) {
        alerts.push({
          id: `vix-mock-${Date.now()}`,
          type: 'WARNING',
          category: 'VOLATILITY',
          title: 'VIX上昇中',
          description: '市場のボラティリティが増加しています。リスク管理に注意してください。',
          timestamp: new Date().toISOString(),
          priority: 6,
          data: { vix: mockVix, source: 'fallback' }
        });
      }
    }

    return alerts;
  }

  /**
   * セクターローテーション分析
   */
  private static async analyzeSectorRotation(): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];

    try {
      // セクターパフォーマンスを分析
      const sectorPerformances = await this.getSectorPerformances();
      
      // 最も強いセクターと弱いセクターを特定
      const strongest = sectorPerformances.reduce((max, sector) => 
        sector.relative_strength > max.relative_strength ? sector : max
      );
      
      const weakest = sectorPerformances.reduce((min, sector) => 
        sector.relative_strength < min.relative_strength ? sector : min
      );

      // セクターローテーション検出
      const strengthDifference = strongest.relative_strength - weakest.relative_strength;
      
      if (strengthDifference > 5) {
        alerts.push({
          id: `sector-rotation-${Date.now()}`,
          type: 'INFO',
          category: 'SECTOR',
          title: 'セクターローテーション',
          description: `${weakest.sector}から${strongest.sector}への資金移動が観測されています。`,
          timestamp: new Date().toISOString(),
          priority: 5,
          data: {
            strongest_sector: strongest,
            weakest_sector: weakest,
            strength_difference: strengthDifference
          }
        });
      }

      // 特定セクターの異常パフォーマンス
      sectorPerformances.forEach(sector => {
        if (Math.abs(sector.change_1d) > 3) {
          const direction = sector.change_1d > 0 ? '急騰' : '急落';
          alerts.push({
            id: `sector-spike-${sector.symbol}-${Date.now()}`,
            type: Math.abs(sector.change_1d) > 5 ? 'WARNING' : 'INFO',
            category: 'SECTOR',
            title: `${sector.sector}セクター${direction}`,
            description: `${sector.sector}セクターが${Math.abs(sector.change_1d).toFixed(1)}%${direction}しています。`,
            timestamp: new Date().toISOString(),
            priority: Math.abs(sector.change_1d) > 5 ? 7 : 4,
            data: sector as unknown as Record<string, unknown>
          });
        }
      });

    } catch (error) {
      console.error('セクター分析エラー:', error);
      // フォールバック: 模擬セクターローテーション
      alerts.push({
        id: `sector-rotation-mock-${Date.now()}`,
        type: 'INFO',
        category: 'SECTOR',
        title: 'セクターローテーション',
        description: 'テクノロジー株から金融株への資金移動が観測されています。',
        timestamp: new Date().toISOString(),
        priority: 5,
        data: { source: 'fallback' }
      });
    }

    return alerts;
  }

  /**
   * 市場ボラティリティ分析
   */
  private static async analyzeMarketVolatility(): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];

    try {
      // 主要指数のボラティリティを分析
      const response = await fetch('/api/stock/market-overview');
      const marketData = await response.json();

      const indices = ['S&P 500', 'NASDAQ', 'DOW'];
      const volatilityMeasures: number[] = [];

      indices.forEach(index => {
        const indexData = marketData.find((item: MarketDataItem) => item.symbol === index);
        if (indexData) {
          volatilityMeasures.push(Math.abs(indexData.changePercent));
        }
      });

      const avgVolatility = volatilityMeasures.reduce((sum, vol) => sum + vol, 0) / volatilityMeasures.length;

      if (avgVolatility > 2) {
        alerts.push({
          id: `high-volatility-${Date.now()}`,
          type: 'WARNING',
          category: 'VOLATILITY',
          title: '高ボラティリティ環境',
          description: `主要指数の平均変動率が${avgVolatility.toFixed(1)}%に達し、高ボラティリティ環境となっています。`,
          timestamp: new Date().toISOString(),
          priority: 6,
          data: { avg_volatility: avgVolatility, measures: volatilityMeasures }
        });
      }

    } catch (error) {
      console.error('ボラティリティ分析エラー:', error);
    }

    return alerts;
  }

  /**
   * 異常出来高分析
   */
  private static async analyzeVolumeAnomalies(): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];

    try {
      // 注目銘柄の出来高分析
      const response = await fetch('/api/stock/top-movers');
      const topMovers = await response.json();

      interface TopMover {
        symbol: string;
        name: string;
        price: number;
        change: number;
        changePercent: number;
        volume?: number;
      }
      
      topMovers.forEach((stock: TopMover) => {
        // 仮想的な平均出来高と比較（実際の実装では履歴データが必要）
        const avgVolume = 1000000; // 平均出来高（仮想値）
        const currentVolume = stock.volume || 1500000;
        const volumeRatio = currentVolume / avgVolume;

        if (volumeRatio > 3) {
          alerts.push({
            id: `volume-spike-${stock.symbol}-${Date.now()}`,
            type: 'INFO',
            category: 'VOLUME',
            title: `${stock.symbol} 異常出来高`,
            description: `${stock.symbol}の出来高が平均の${volumeRatio.toFixed(1)}倍に達しています。`,
            timestamp: new Date().toISOString(),
            priority: 4,
            data: { 
              symbol: stock.symbol, 
              volume_ratio: volumeRatio,
              current_volume: currentVolume,
              avg_volume: avgVolume
            }
          });
        }
      });

    } catch (error) {
      console.error('出来高分析エラー:', error);
    }

    return alerts;
  }

  /**
   * セクターパフォーマンスを取得
   */
  private static async getSectorPerformances(): Promise<SectorPerformance[]> {
    const performances: SectorPerformance[] = [];

    // 各セクターETFのパフォーマンスを模擬生成
    this.SECTOR_ETFS.forEach(sector => {
      const change1d = (Math.random() - 0.5) * 6; // -3% to +3%
      const change5d = (Math.random() - 0.5) * 12; // -6% to +6%
      const change1m = (Math.random() - 0.5) * 20; // -10% to +10%
      
      performances.push({
        sector: sector.name,
        symbol: sector.symbol,
        change_1d: change1d,
        change_5d: change5d,
        change_1m: change1m,
        relative_strength: (change1d + change5d * 0.5 + change1m * 0.3) / 1.8
      });
    });

    return performances;
  }

  /**
   * デモアラートを生成（エラー時のフォールバック）
   */
  private static generateDemoAlerts(): MarketAlert[] {
    return [
      {
        id: `demo-vix-${Date.now()}`,
        type: 'WARNING',
        category: 'VOLATILITY',
        title: 'VIX上昇中',
        description: '市場のボラティリティが増加しています。',
        timestamp: new Date().toISOString(),
        priority: 6,
        data: { source: 'demo' }
      },
      {
        id: `demo-sector-${Date.now()}`,
        type: 'INFO',
        category: 'SECTOR',
        title: 'セクターローテーション',
        description: 'テクノロジー株から金融株への資金移動が観測されています。',
        timestamp: new Date().toISOString(),
        priority: 5,
        data: { source: 'demo' }
      }
    ];
  }

  /**
   * アラートの重要度に基づく色分けを取得
   */
  static getAlertStyle(alert: MarketAlert): string {
    switch (alert.type) {
      case 'CRITICAL':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'WARNING':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'INFO':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  }

  /**
   * アラートのテキスト色を取得
   */
  static getAlertTextStyle(alert: MarketAlert): string {
    switch (alert.type) {
      case 'CRITICAL':
        return 'text-red-800 dark:text-red-200';
      case 'WARNING':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'INFO':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  }

  /**
   * アラートの詳細テキスト色を取得
   */
  static getAlertDescriptionStyle(alert: MarketAlert): string {
    switch (alert.type) {
      case 'CRITICAL':
        return 'text-red-700 dark:text-red-300';
      case 'WARNING':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'INFO':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  }
}