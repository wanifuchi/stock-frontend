import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://stock-backend-production-4ff1.up.railway.app';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const params = await context.params;
    const { symbol } = params;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Railwayバックエンドの株式情報APIを呼び出し
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

    return NextResponse.json(data);

  } catch (error) {
    console.error(`株式情報取得エラー (${(await context.params).symbol}):`, error);
    
    // フォールバック：基本的な株式情報
    const symbol = (await context.params).symbol;
    const fallbackData = {
      symbol: symbol,
      name: `${symbol} Corporation`,
      current_price: 100.00,
      change: 0.00,
      change_percent: 0.00,
      high: 105.00,
      low: 95.00,
      open: 100.00,
      previous_close: 100.00,
      volume: 1000000,
      market_cap: 100000000000,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fallbackData);
  }
}