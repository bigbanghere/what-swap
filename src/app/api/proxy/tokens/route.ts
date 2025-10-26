import { NextRequest, NextResponse } from 'next/server';

const SWAP_COFFEE_API_BASE = 'https://tokens.swap.coffee/api/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Build the full API URL with query parameters
    const apiUrl = new URL(`${SWAP_COFFEE_API_BASE}/${path}`);
    
    // Forward all query parameters (except 'path' which is the API path)
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        apiUrl.searchParams.append(key, value);
      }
    });
    
    console.log(`🌐 Proxy: Forwarding to ${apiUrl.toString()}`);
    
    // Forward the request to Swap.coffee API
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Swap.coffee API' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

