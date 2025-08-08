// app/api/test-webhook/route.ts
export async function POST(req: Request) {
  const { url, method, headers, body } = await req.json()
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? body : undefined
    })
    return new Response(JSON.stringify({ status: response.status }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ status: 500 }), { status: 500 })
  }
}