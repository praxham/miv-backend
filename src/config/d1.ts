import "dotenv/config";

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_DATABASE_ID}`;

const headers = {
  Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
  "Content-Type": "application/json",
};

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sql, params }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  if (!data.success) {
    throw new Error(JSON.stringify(data.errors));
  }
  return data.result[0].results as T[];
}

export default query;
