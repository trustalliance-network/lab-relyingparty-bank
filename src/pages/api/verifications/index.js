export const runtime = 'edge';
const API_URL = process.env.PROVEN_ISSUER_API_URL;
const API_KEY = process.env.PROVEN_ISSUER_API_KEY;
const schemas = [
  {
    schema_id: 'QNetK7HNqt4mdmWRKGxzrZ:2:GHG_Report:1.0',
    schema_attributes: [
      'report_id',
      'organisation_id',
      'organisation_address',
      'full_report_pdf_url',
      'period_start_date',
      'period_end_date',
      'report_issuer',
      'co2e',
      'baseline',
      'target',
      'ch4',
      'n2o',
      'total',
    ],
  },
];

export default async function handler(req) {

  const body = await req.json();

  if (!body.contact_id) {
    return Response.json({ error: 'Missing contact_id' }, { status: 400 });
  }

  const requestBody = {
    contact_id: body.contact_id,
    invitation_id: body.invitation_id,
    schemas: schemas,
    timeout: null,
    rule: null,
  };

  const res = await fetch(`${API_URL}/api/v1/verifications`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!res.ok) {
    const body = await res.text();
    return Response.json({ error: 'Error requesting verification', body }, { status: res.status });
  }

  const responseBody = await res.json();

  return Response.json(responseBody, { status: res.status });
}
