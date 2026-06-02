import { NextResponse } from 'next/server';

export const maxDuration = 60; // Increase timeout if needed
export const dynamic = 'force-dynamic';

export async function GET(request) {
  return handleProxy(request);
}
export async function POST(request) {
  return handleProxy(request);
}
export async function PUT(request) {
  return handleProxy(request);
}
export async function DELETE(request) {
  return handleProxy(request);
}
export async function PATCH(request) {
  return handleProxy(request);
}

async function handleProxy(request) {
  try {
    // request.nextUrl.pathname is e.g. '/api/blogs'
    // We strip the leading '/api/' or '/api' to get '/blogs'
    const path = request.nextUrl.pathname.replace(/^\/api\/?/, '/');
    const searchParams = request.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';
    
    // Construct the backend URL
    const backendBase = 'https://api.plotyards.com/api';
    const targetUrl = `${backendBase}${path === '/' ? '' : path}${query}`;

    // Forward safe headers
    const headers = new Headers();
    const unsafeHeaders = ['host', 'connection', 'content-length', 'transfer-encoding', 'accept-encoding'];
    request.headers.forEach((value, key) => {
      if (!unsafeHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const init = {
      method: request.method,
      headers: headers,
    };

    // Forward body if not GET/HEAD
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) init.body = body;
    }

    const response = await fetch(targetUrl, init);

    // Read the response body
    const responseBody = await response.text();
    
    // Create new response
    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!unsafeHeaders.includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Proxy Error' }, { status: 500 });
  }
}
