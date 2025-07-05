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

    // Railwayバックエンドのテクニカル指標APIを呼び出し
    const url = `${RAILWAY_API_URL}/api/stocks/${symbol}/indicators`;
    
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
    console.error(`テクニカル指標取得エラー (${(await context.params).symbol}):`, error);
    
    // フォールバック：模擬テクニカル指標データ
    const symbol = (await context.params).symbol;
    
    // 模擬データを生成
    const fallbackData = {
      symbol: symbol,
      rsi: Math.floor(Math.random() * 100), // 0-100のRSI値
      macd: {
        macd: Number((Math.random() * 4 - 2).toFixed(4)), // -2から2のMACD値
        signal: Number((Math.random() * 4 - 2).toFixed(4)),
        histogram: Number((Math.random() * 2 - 1).toFixed(4))
      },
      bollinger_bands: {
        upper: Number((100 + Math.random() * 20).toFixed(2)),
        middle: Number((100 + Math.random() * 10).toFixed(2)),
        lower: Number((100 - Math.random() * 10).toFixed(2))
      },
      moving_averages: {
        sma_20: Number((100 + Math.random() * 10 - 5).toFixed(2)),
        sma_50: Number((100 + Math.random() * 15 - 7.5).toFixed(2)),
        sma_200: Number((100 + Math.random() * 20 - 10).toFixed(2))
      },
      source: 'fallback',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fallbackData);
  }
}