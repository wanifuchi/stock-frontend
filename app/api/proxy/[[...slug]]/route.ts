import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stock-backend-production-4ff1.up.railway.app';

export async function GET(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { slug?: string[] },
  method: string
) {
  try {
    const { slug } = params;
    const path = slug ? slug.join('/') : '';
    const searchParams = request.nextUrl.searchParams.toString();
    
    // バックエンドAPIのURL構築
    const backendUrl = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`プロキシリクエスト: ${method} ${backendUrl}`);
    console.log(`リクエストパス: ${path}`);
    console.log(`検索パラメータ: ${searchParams}`);
    
    // リクエストボディの取得（POST/PUT の場合）
    let body = null;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await request.json();
      } catch (error) {
        // リクエストボディが空の場合はnullのまま
      }
    }
    
    // バックエンドAPIへのリクエスト
    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // 必要に応じて他のヘッダーを追加
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      console.error(`バックエンドAPIエラー: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'バックエンドAPIエラー', status: response.status },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    console.log(`プロキシレスポンス成功: ${response.status}`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('プロキシエラー:', error);
    return NextResponse.json(
      { error: 'プロキシサーバーエラー', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}