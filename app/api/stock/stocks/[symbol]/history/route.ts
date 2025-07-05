import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://stock-backend-production-4ff1.up.railway.app';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const params = await context.params;
    const { symbol } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1mo';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Railwayバックエンドの価格履歴APIを呼び出し
    const url = `${RAILWAY_API_URL}/api/stocks/${symbol}/history?period=${period}`;
    
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
    console.error(`価格履歴取得エラー (${(await context.params).symbol}):`, error);
    
    // フォールバック：模擬価格履歴データ
    const symbol = (await context.params).symbol;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1mo';
    
    // 期間に応じたデータポイント数を決定
    const dataPoints = period === '1mo' ? 30 : period === '3mo' ? 90 : period === '1y' ? 365 : 30;
    
    // 模擬価格データを生成
    const basePrice = 100;
    const dates: string[] = [];
    const prices: number[] = [];
    const volumes: number[] = [];
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      
      // ランダムな価格変動を生成
      const variation = (Math.random() - 0.5) * 0.1; // ±5%の変動
      const price = basePrice * (1 + variation);
      prices.push(Number(price.toFixed(2)));
      
      // ランダムな出来高を生成
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      volumes.push(volume);
    }

    const fallbackData = {
      symbol: symbol,
      period: period,
      dates: dates,
      prices: prices,
      volumes: volumes,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fallbackData);
  }
}