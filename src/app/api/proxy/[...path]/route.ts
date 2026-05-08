import { NextRequest, NextResponse } from 'next/server';

const PARTNER_BASE_URL = 'https://platform.bankkaro.com/partner';
// bk-api is the public-facing BankKaro API. It supports CORS and needs no auth.
// The partner API key does not have permission for cardgenius/cards on platform.bankkaro.com,
// so card listing routes are forwarded here instead.
const BK_API_BASE = 'https://bk-api.bankkaro.com/sp/api';

// Paths (relative to /api/proxy/) that should be routed to bk-api instead of the partner API.
const BK_API_ROUTE_MAP: Record<string, string> = {
  'cg-eligiblity': 'cg-eligiblity',
};

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const joinedPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();

  // Route card listing through the public bk-api (no auth needed)
  const bkApiPath = BK_API_ROUTE_MAP[joinedPath];
  if (bkApiPath) {
    const targetUrl = `${BK_API_BASE}/${bkApiPath}${searchParams ? `?${searchParams}` : ''}`;
    console.log(`[proxy] ${request.method} ${joinedPath} → ${targetUrl}`);
    try {
      const fetchInit: RequestInit = { method: request.method };
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        fetchInit.body = await request.text();
        fetchInit.headers = { 'Content-Type': 'application/json' };
      }
      const response = await fetch(targetUrl, fetchInit);
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error('BK API proxy error:', error);
      return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
    }
  }


  // All other paths: forward to the partner API with JWT auth
  const partnerToken = request.headers.get('partner-token');
  if (!partnerToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'partner-token': partnerToken,
  };

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const targetUrl = `${PARTNER_BASE_URL}/${joinedPath}${searchParams ? `?${searchParams}` : ''}`;
  console.log(`[proxy] ${request.method} ${joinedPath} → ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, init);
    const rawText = await response.text();
    console.log(`[proxy] upstream ${response.status} for ${joinedPath}:`, rawText);
    let data: unknown;
    try { data = JSON.parse(rawText); } catch { data = { _raw: rawText }; }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Partner API proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
