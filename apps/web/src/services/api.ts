const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiError extends Error {
    status: number;
    body: any;
    constructor(status: number, body: any) {
        super(body?.message ?? `API Error ${status}`);
        this.status = status;
        this.body = body;
    }
}

export async function apiRequest<T>(
    path: string,
    options?: {
        method?: HttpMethod;
        token?: string | null;
        body?: any;
    }
): Promise<T> {
    const method = options?.method ?? "GET";
    const token = options?.token ?? null;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) throw new ApiError(res.status, data);
    return data as T;
}