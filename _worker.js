export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // Halaman utama
    if (url.pathname === "/") {
      return env.ASSETS.fetch(request);
    // return fetch("https://try-hosting-with-supabase-v4.iblis150980.workers.dev/");
    // return fetch("https://try-hosting-with-supabase-v5.pages.dev/");

    }

    // Routing API
    if (url.pathname === "/api/insert" && method === "POST") {
      return await handleInsert(request, env);
    }

    if (url.pathname === "/api/select" && method === "GET") {
      return await handleSelect(env);
    }

    if (url.pathname.startsWith("/api/delete/") && method === "DELETE") {
      const id = url.pathname.split("/").pop();
      return await handleDelete(id, env);
    }

    // Default → coba ambil file statis lain (CSS, JS, dll.)
    return env.ASSETS.fetch(request);
  }
};

async function handleInsert(request, env) {
  const body = await request.json();
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud`, {
    method: "POST",
    headers: {
      "apikey": env.SUPABASE_SERVICE_ROLE,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(body)
  });
  return new Response(await res.text(), { status: res.status });
}

async function handleSelect(env) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?select=*`, {
    headers: {
      "apikey": env.SUPABASE_SERVICE_ROLE,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
    }
  });
  return new Response(await res.text(), { status: res.status });
}

async function handleDelete(id, env) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey": env.SUPABASE_SERVICE_ROLE,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
    }
  });
  return new Response(await res.text(), { status: res.status });
}
