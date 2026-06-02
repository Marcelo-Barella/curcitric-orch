import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server-client", () => ({
  createCurcitricSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

function makeChain(data: unknown, error: unknown = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  };
  return chain;
}

describe("POST /api/projects/[projectId]/runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { POST } = await import(
      "../app/api/projects/[projectId]/runs/route.js"
    );
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "test-id" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 404 when project is not found", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockFrom.mockReturnValue(makeChain(null));

    const { POST } = await import(
      "../app/api/projects/[projectId]/runs/route.js"
    );
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "missing-id" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 403 when user is not a member", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    const projectChain = makeChain({ org_id: "org-1" });
    const membershipChain = makeChain(null);
    mockFrom
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(membershipChain);

    const { POST } = await import(
      "../app/api/projects/[projectId]/runs/route.js"
    );
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "proj-1" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 200 with runId on success", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    const projectChain = makeChain({ org_id: "org-1" });
    const membershipChain = makeChain({ role: "admin" });
    const insertChain = makeChain({ id: "run-123" });
    const jobChain = { insert: vi.fn().mockResolvedValue({ error: null }) };

    mockFrom
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(membershipChain)
      .mockReturnValueOnce(insertChain)
      .mockReturnValueOnce(jobChain);

    const { POST } = await import(
      "../app/api/projects/[projectId]/runs/route.js"
    );
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "proj-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.runId).toBe("run-123");
  });

  it("rolls back run when job insert fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    const projectChain = makeChain({ org_id: "org-1" });
    const membershipChain = makeChain({ role: "admin" });
    const insertChain = makeChain({ id: "run-123" });
    const jobChain = {
      insert: vi.fn().mockResolvedValue({ error: { message: "rls denied" } }),
    };
    const rollbackChain = makeChain(null);
    rollbackChain.eq = vi.fn().mockResolvedValue({ error: null });

    mockFrom
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(membershipChain)
      .mockReturnValueOnce(insertChain)
      .mockReturnValueOnce(jobChain)
      .mockReturnValueOnce(rollbackChain);

    const { POST } = await import(
      "../app/api/projects/[projectId]/runs/route.js"
    );
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "proj-1" }),
    });

    expect(response.status).toBe(400);
    expect(rollbackChain.delete).toHaveBeenCalled();
    expect(rollbackChain.eq).toHaveBeenCalledWith("id", "run-123");
  });
});
