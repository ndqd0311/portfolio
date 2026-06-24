import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ─── Simple JWT signer for Google OAuth2 ────────────────────────────────────
async function getAccessToken(serviceAccountKey) {
  const key = JSON.parse(serviceAccountKey);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const toSign = `${headerB64}.${payloadB64}`;

  // Import the RSA private key
  const pemKey = key.private_key.replace(/\\n/g, '\n');
  const keyData = pemKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');

  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(toSign));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${toSign}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

// ─── Run GA4 report ──────────────────────────────────────────────────────────
async function runReport(accessToken, propertyId, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ─── Parse GA4 rows to [{dimension, metric}] ────────────────────────────────
function parseRows(report, dimIndex = 0, metricIndex = 0) {
  if (!report?.rows) return [];
  return report.rows.map((row) => ({
    x: row.dimensionValues?.[dimIndex]?.value ?? '(not set)',
    y: parseInt(row.metricValues?.[metricIndex]?.value ?? '0', 10),
  }));
}

function parseDateRows(report) {
  if (!report?.rows) return [];
  return report.rows
    .map((row) => ({
      t: row.dimensionValues?.[0]?.value, // YYYYMMDD
      y: parseInt(row.metricValues?.[0]?.value ?? '0', 10),
    }))
    .sort((a, b) => a.t.localeCompare(b.t));
}

export async function GET(request) {
  const GA_SERVICE_ACCOUNT_KEY = process.env.GA_SERVICE_ACCOUNT_KEY;
  const GA_PROPERTY_ID = process.env.NEXT_PUBLIC_GA_PROPERTY_ID;

  if (!GA_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      { error: 'GA_SERVICE_ACCOUNT_KEY not configured.' },
      { status: 503 }
    );
  }

  if (!GA_PROPERTY_ID) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_GA_PROPERTY_ID not configured.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') ?? '7', 10);

  const dateRange = { startDate: `${days}daysAgo`, endDate: 'today' };

  try {
    const accessToken = await getAccessToken(GA_SERVICE_ACCOUNT_KEY);

    // Run all reports in parallel
    const [
      summaryReport,
      pageviewsReport,
      topPagesReport,
      deviceReport,
      browserReport,
      countryReport,
      sourceReport,
    ] = await Promise.all([
      // Summary: users, sessions, pageviews, avg session duration, bounce rate
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'newUsers' },
        ],
      }),

      // Pageviews over time (by date)
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),

      // Top pages
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),

      // Device category
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),

      // Browser
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'browser' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),

      // Country
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),

      // Traffic source
      runReport(accessToken, GA_PROPERTY_ID, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
    ]);

    // Parse summary
    const summaryRow = summaryReport?.rows?.[0];
    const summary = summaryRow
      ? {
          totalUsers: parseInt(summaryRow.metricValues[0]?.value ?? 0),
          sessions: parseInt(summaryRow.metricValues[1]?.value ?? 0),
          pageviews: parseInt(summaryRow.metricValues[2]?.value ?? 0),
          avgSessionDuration: parseFloat(summaryRow.metricValues[3]?.value ?? 0),
          bounceRate: parseFloat(summaryRow.metricValues[4]?.value ?? 0) * 100,
          newUsers: parseInt(summaryRow.metricValues[5]?.value ?? 0),
        }
      : null;

    // Parse pageviews over time
    const rows = pageviewsReport?.rows ?? [];
    const pageviewsOverTime = rows
      .map((row) => ({
        t: row.dimensionValues[0]?.value,
        pageviews: parseInt(row.metricValues[0]?.value ?? 0),
        sessions: parseInt(row.metricValues[1]?.value ?? 0),
      }))
      .sort((a, b) => a.t.localeCompare(b.t));

    return NextResponse.json(
      {
        summary,
        pageviewsOverTime,
        topPages: parseRows(topPagesReport),
        devices: parseRows(deviceReport),
        browsers: parseRows(browserReport),
        countries: parseRows(countryReport),
        sources: parseRows(sourceReport),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[GA4 API]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
