import { NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://stock-backend-production-4ff1.up.railway.app';

// 主要銘柄のリスト
const TOP_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc' },
  { symbol: 'META', name: 'Meta Platforms Inc' },
  { symbol: 'GOOGL', name: 'Alphabet Inc' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AAPL', name: 'Apple Inc' }
];

async function fetchStockDataFromRailway(symbol: string) {
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
    symbol: data.symbol,
    name: data.name,
    price: data.current_price,
    change: data.change,
    changePercent: data.change_percent
  };
}

export async function GET() {
  try {
    // Railwayバックエンドからリアルタイムデータを取得
    const promises = TOP_STOCKS.map(async (stock) => {
      try {
        return await fetchStockDataFromRailway(stock.symbol);
      } catch (error) {
        console.error(`Error fetching ${stock.symbol} from Railway:`, error);
        // Railway APIが失敗した場合は個別にフォールバックデータを返す
        const fallbackMap: { [key: string]: any } = {
          'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 138.95, change: 2.45, changePercent: 1.79 },
          'TSLA': { symbol: 'TSLA', name: 'Tesla Inc', price: 271.99, change: -3.21, changePercent: -1.17 },
          'META': { symbol: 'META', name: 'Meta Platforms Inc', price: 568.73, change: 8.45, changePercent: 1.51 },
          'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc', price: 184.52, change: 2.34, changePercent: 1.29 },
          'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 448.73, change: 1.85, changePercent: 0.41 },
          'AAPL': { symbol: 'AAPL', name: 'Apple Inc', price: 227.52, change: -1.23, changePercent: -0.54 }
        };
        
        return fallbackMap[stock.symbol] || {
          symbol: stock.symbol,
          name: stock.name,
          price: 100,
          change: 0,
          changePercent: 0
        };
      }
    });

    const stockData = await Promise.all(promises);
    
    return NextResponse.json(stockData);

  } catch (error) {
    console.error('注目銘柄データ取得エラー:', error);
    
    // 完全なフォールバックデータ（Railway接続完全失敗時）
    const fallbackData = [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 138.95, change: 2.45, changePercent: 1.79 },
      { symbol: 'TSLA', name: 'Tesla Inc', price: 271.99, change: -3.21, changePercent: -1.17 },
      { symbol: 'META', name: 'Meta Platforms Inc', price: 568.73, change: 8.45, changePercent: 1.51 },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: 184.52, change: 2.34, changePercent: 1.29 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 448.73, change: 1.85, changePercent: 0.41 },
      { symbol: 'AAPL', name: 'Apple Inc', price: 227.52, change: -1.23, changePercent: -0.54 }
    ];
    
    return NextResponse.json(fallbackData);
  }
}