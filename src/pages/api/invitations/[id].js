export const runtime = 'edge';

const API_URL = process.env.VERIFIER_API_URL;
const API_KEY = process.env.VERIFIER_API_KEY;

export default async function handler(req, res) {
  const id = req.nextUrl.searchParams.get('id');

  const response = await fetch(`${API_URL}/api/v1/invitations/${id}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  const body = await response.json();

  return Response.json(body, { status: 200 });
}
