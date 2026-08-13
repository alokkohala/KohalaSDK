// Offline smoke test for @kohala/sdk against the built dist output.
// Uses a stub fetch so it needs no network or real API key: it proves URL
// building, header assembly, body serialization, JSON parsing, and error
// mapping all work end-to-end through the public surface.
import assert from "node:assert/strict";
import { Kohala, KohalaError } from "../dist/index.js";

let lastRequest = null;
function stubFetch(response) {
  return async (url, init) => {
    lastRequest = { url, init };
    return response();
  };
}
function jsonResponse(status, body) {
  return () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", "x-request-id": "req_test" },
    });
}

async function main() {
  // 1. Requires an apiKey.
  assert.throws(() => new Kohala({}), /apiKey/);

  // 2. Default base URL + auth header + agents.list path.
  const kohala = new Kohala({
    apiKey: "pk_test_123",
    fetch: stubFetch(jsonResponse(200, [{ id: 1, name: "Demo" }])),
  });
  assert.equal(kohala.baseUrl, "https://kohala.ai");
  const agents = await kohala.agents.list();
  assert.equal(lastRequest.url, "https://kohala.ai/api/v1/agents");
  assert.equal(lastRequest.init.headers.Authorization, "Bearer pk_test_123");
  assert.equal(agents[0].name, "Demo");

  // 3. Custom baseUrl, query params, and body serialization.
  const local = new Kohala({
    apiKey: "pk_test_123",
    baseUrl: "http://localhost:5000/",
    fetch: stubFetch(jsonResponse(201, { id: 7, name: "Made" })),
  });
  await local.agents.create({ name: "Made", charter: "do a thing" });
  assert.equal(lastRequest.url, "http://localhost:5000/api/v1/agents");
  assert.equal(lastRequest.init.method, "POST");
  assert.equal(JSON.parse(lastRequest.init.body).charter, "do a thing");

  const runs = new Kohala({
    apiKey: "pk_test_123",
    fetch: stubFetch(jsonResponse(200, { runs: [], total: 0, limit: 5, offset: 0 })),
  });
  await runs.runs.list(7, { limit: 5 });
  assert.equal(lastRequest.url, "https://kohala.ai/api/v1/agents/7/agent-runs?limit=5");

  // 4. Koan embed URL helper (no network).
  assert.equal(
    kohala.koans.embedUrl("my-koan", { view: "detail" }),
    "https://kohala.ai/api/koans/my-koan/render?view=detail",
  );

  // 5. Error mapping: non-2xx throws a KohalaError with status + code.
  const failing = new Kohala({
    apiKey: "pk_test_123",
    fetch: stubFetch(jsonResponse(404, { error: "not_found", message: "no such agent" })),
  });
  await assert.rejects(
    () => failing.agents.get(999),
    (err) => {
      assert.ok(err instanceof KohalaError);
      assert.equal(err.status, 404);
      assert.equal(err.code, "not_found");
      assert.equal(err.message, "no such agent");
      assert.equal(err.requestId, "req_test");
      return true;
    },
  );

  console.log("✓ @kohala/sdk smoke test passed");
}

main().catch((err) => {
  console.error("✗ smoke test failed:", err);
  process.exit(1);
});
