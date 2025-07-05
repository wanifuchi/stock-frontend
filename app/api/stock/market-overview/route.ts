import { NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://stock-backend-production-4ff1.up.railway.app';

// 主要な株価指数のシンボルマッピング（ETFを使用）
const MAJOR_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ' },
  { symbol: 'DIA', name: 'DOW' },
  { symbol: 'VIX', name: 'VIX' }
];

async function fetchMarketDataFromRailway(symbol: string) {
  const url = `${RAILWAY_API_URL}/api/stocks/${symbol}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Railway API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.status === 'error') {
    throw new Error(data.message || 'Railway API returned error');
  }

  return {
    symbol,
    value: data.current_price,
    change: data.change,
    changePercent: data.change_percent
  };
}

export async function GET() {
  try {
    // Railwayバックエンドから市場データを取得
    const promises = MAJOR_INDICES.map(async (index) => {
      try {
        const data = await fetchMarketDataFromRailway(index.symbol);
        return {
          symbol: index.name,
          value: data.value,
          change: data.change,
          changePercent: data.changePercent
        };
      } catch (error) {
        console.error(`Error fetching ${index.symbol} from Railway:`, error);
        // Railway APIが失敗した場合は個別にフォールバックデータを返す
        const fallbackMap: { [key: string]: any } = {
          'S&P 500': { symbol: 'S&P 500', value: 5547.25, change: 12.45, changePercent: 0.23 },
          'NASDAQ': { symbol: 'NASDAQ', value: 17833.45, change: -23.12, changePercent: -0.13 },
          'DOW': { symbol: 'DOW', value: 39308.00, change: 34.67, changePercent: 0.09 },
          'VIX': { symbol: 'VIX', value: 12.45, change: -0.87, changePercent: -6.53 }
        };
        
        return fallbackMap[index.name] || {
          symbol: index.name,
          value: 0,
          change: 0,
          changePercent: 0
        };
      }
    });

    const marketData = await Promise.all(promises);
    return NextResponse.json(marketData);

  } catch (error) {
    console.error('市場概況データ取得エラー:', error);
    
    // フォールバックデータ（Railway接続完全失敗時）
    const fallbackData = [
      { symbol: 'S&P 500', value: 5547.25, change: 12.45, changePercent: 0.23 },
      { symbol: 'NASDAQ', value: 17833.45, change: -23.12, changePercent: -0.13 },
      { symbol: 'DOW', value: 39308.00, change: 34.67, changePercent: 0.09 },
      { symbol: 'VIX', value: 12.45, change: -0.87, changePercent: -6.53 }
    ];
    
    return NextResponse.json(fallbackData);
  }
}