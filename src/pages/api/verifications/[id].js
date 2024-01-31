export const runtime = 'edge'
const API_URL = process.env.PROVEN_ISSUER_API_URL;
const API_KEY = process.env.PROVEN_ISSUER_API_KEY;

export default async function handler(req) {
  const id = req.nextUrl.searchParams.get('id');

  const response = await fetch(`${API_URL}/api/v1/verifications/${id}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });
  const body = await response.json();

  return Response.json(body, { status: 200 });
}
