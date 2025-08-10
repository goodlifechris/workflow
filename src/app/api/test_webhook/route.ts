import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('[WEBHOOK API] Request received at:', new Date().toISOString());
  
  try {
    const requestData = await req.json();
    console.log('[WEBHOOK API] Request data:', JSON.stringify(requestData, null, 2));

    const { url, method, headers, body } = requestData;

    // Validate required fields
    if (!url || typeof url !== 'string') {
      console.error('[WEBHOOK API] Validation failed: Invalid or missing URL');
      return NextResponse.json(
        { error: 'Invalid or missing URL' },
        { status: 400 }
      );
    }

    if (!method || !['GET', 'POST'].includes(method)) {
      console.error('[WEBHOOK API] Validation failed: Invalid or missing HTTP method');
      return NextResponse.json(
        { error: 'Invalid or missing HTTP method' },
        { status: 400 }
      );
    }

    console.log(`[WEBHOOK API] Attempting to call ${method} ${url}`);

    try {
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method === 'POST' ? JSON.stringify(body) : undefined
      };
      
      console.log('[WEBHOOK API] Fetch options:', JSON.stringify(fetchOptions, null, 2));

      const startTime = Date.now();
      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;

      console.log(`[WEBHOOK API] Webhook response - Status: ${response.status}, Duration: ${duration}ms`);

      return NextResponse.json({ 
        status: response.status,
        statusText: response.statusText
      });
      
    } catch (error) {
      console.error('[WEBHOOK API] Webhook test failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to reach the webhook URL',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[WEBHOOK API] Invalid request format:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}