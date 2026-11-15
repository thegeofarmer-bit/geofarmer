export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RunResult {
  json: unknown;
  neurons: number;
}

interface RunResponse {
  success: boolean;
  errors?: { message: string }[];
  result?: {
    response?: unknown;
    choices?: { message?: { content?: string | null } }[];
    usage?: { neurons?: number };
  };
}

function extractJson(result: RunResponse["result"]): unknown {
  const raw = result?.response ?? result?.choices?.[0]?.message?.content;
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string") throw new Error("Workers AI returned no content");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Workers AI returned no JSON object");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function runJson(
  model: string,
  messages: ChatMessage[],
  schema: object,
  { timeoutMs = 25_000, attempts = 2 } = {},
): Promise<RunResult> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error("Cloudflare Workers AI is not configured");

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          temperature: 0,
          max_tokens: 900,
          response_format: { type: "json_schema", json_schema: { name: "advice", strict: true, schema } },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = (await res.json()) as RunResponse;
      if (!res.ok || !body.success) {
        throw new Error(body.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`);
      }
      return { json: extractJson(body.result), neurons: body.result?.usage?.neurons ?? 0 };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
