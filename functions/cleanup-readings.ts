import { createAdminClient } from 'npm:@insforge/sdk';

export default async function(_req: Request): Promise<Response> {
  const client = createAdminClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    apiKey: Deno.env.get('INSFORGE_API_KEY')
  });

  // Delete readings older than 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await client.database
    .from('energy_readings')
    .delete()
    .lt('timestamp', sevenDaysAgo);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, deleted_before: sevenDaysAgo }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
