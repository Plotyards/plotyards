import { NextResponse } from 'next/server';

export const maxDuration = 60; // Increase timeout if needed
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  return handleProxy(request, params.path);
}
export async function POST(request, { params }) {
  return handleProxy(request, params.path);
}
export async function PUT(request, { params }) {
  return handleProxy(request, params.path);
}
export async function DELETE(request, { params }) {
  return handleProxy(request, params.path);
}
export async function PATCH(request, { params }) {
  return handleProxy(request, params.path);
}

async function handleProxy(request, pathArray) {
  try {
    const path = pathArray ? pathArray.join('/') : '';
    const searchParams = request.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';
    
    // Construct the backend URL
    const backendBase = 'https://api.plotyards.com/api';
    const targetUrl = `${backendBase}/${path}${query}`;

    // Forward headers (except host)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
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
      resHeaders.set(key, value);
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
