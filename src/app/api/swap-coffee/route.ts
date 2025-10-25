import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🔄 API Route: GET request received to /api/swap-coffee');
  return NextResponse.json({ message: 'Swap Coffee API proxy is working' });
}

export async function POST(request: NextRequest) {
  console.log('🔄 API Route: POST request received to /api/swap-coffee');
  try {
    const body = await request.json();
    console.log('🔄 API Route: Request body:', body);
    const { endpoint, data } = body;

    // Validate the endpoint to prevent abuse
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    // Only allow specific swap.coffee endpoints
    const allowedEndpoints = [
      '/api/v1/routing/build-route',
      '/api/v1/routing/build-transactions-v2'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json({ error: 'Endpoint not allowed' }, { status: 403 });
    }

    // Make the request to swap.coffee API
    const response = await fetch(`https://backend.swap.coffee${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Swap.coffee API error:', response.status, errorText);
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
