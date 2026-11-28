const API_ORIGIN = (
  process.env.MW_API_ORIGIN ?? "http://127.0.0.1:4490"
).replace(/\/+$/, "");

export async function dispatchPortalRequest(
  request: Request,
): Promise<Response> {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host");

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
