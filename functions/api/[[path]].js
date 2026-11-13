// Cloudflare Pages Function: keep /api requests on the SAME origin as the React site.
// Set API_ORIGIN and API_PROXY_SECRET on the Pages project (Functions environment).
// Render must have the same API_PROXY_SECRET and DATABASE_URL.
export async function onRequest({ request, env }) {
  const requestURL = new URL(request.url)
  const apiOrigin = env.API_ORIGIN
  const proxySecret = env.API_PROXY_SECRET

  if (!apiOrigin || !proxySecret || proxySecret.length < 32) {
    return Response.json({ error: 'ConsultTime API is not configured.' }, { status: 503 })
  }

  let destination
  try {
    const base = new URL(apiOrigin)
    if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash || base.username || base.password) {
      throw new Error('Unexpected API_ORIGIN format')
    }
    destination = new URL(`${requestURL.pathname}${requestURL.search}`, base.origin)
  } catch {
    return Response.json({ error: 'Invalid API service configuration.' }, { status: 503 })
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    // Cross-origin forms should never be able to spend the user's auth cookie.
    const origin = request.headers.get('origin')
    if (origin && origin !== requestURL.origin) {
      return Response.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 })
    }
  }

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('x-ct-proxy-secret') // Never trust an incoming client-supplied value.
  headers.set('x-ct-proxy-secret', proxySecret)
  headers.set('accept', 'application/json')

  try {
    const upstream = await fetch(destination, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    })
    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.set('Cache-Control', 'no-store')
    // Preserve Set-Cookie: because the backend supplies no Domain attribute,
    // the browser stores the session as a first-party cookie for the Pages domain.
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch {
    return Response.json({ error: 'The ConsultTime API is temporarily unavailable.' }, { status: 502 })
  }
}
