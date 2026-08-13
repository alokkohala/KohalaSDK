import type { Kohala } from "../client";
import type {
  Agent,
  AgentInput,
  AgentUpdate,
  AgentHealth,
  AgentKoans,
  AgentReports,
  Quota,
  QuotaInput,
  Skill,
  SkillInput,
  Report,
  ReportInput,
  Deployment,
  DeploymentShape,
} from "../types";

/** Agent CRUD plus the health, quota, skills, koans, reports, and deployment
 *  sub-resources that hang off `/api/v1/agents/:id/...`. */
export class AgentsResource {
  constructor(private readonly client: Kohala) {}

  list() {
    return this.client.get<Agent[]>("/api/v1/agents");
  }
  get(id: number | string) {
    return this.client.get<Agent>(`/api/v1/agents/${encodeURIComponent(String(id))}`);
  }
  create(input: AgentInput) {
    return this.client.post<Agent>("/api/v1/agents", { body: input });
  }
  update(id: number | string, patch: AgentUpdate) {
    return this.client.patch<Agent>(`/api/v1/agents/${encodeURIComponent(String(id))}`, { body: patch });
  }
  delete(id: number | string) {
    return this.client.delete<{ success?: boolean }>(`/api/v1/agents/${encodeURIComponent(String(id))}`);
  }

  // ---- Health -------------------------------------------------------------
  health(id: number | string, params?: { days?: number }) {
    return this.client.get<{ health: AgentHealth | null; days: number }>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/health`,
      { query: params },
    );
  }

  // ---- Quota (governance) -------------------------------------------------
  getQuota(id: number | string) {
    return this.client.get<{ quota: Quota | null }>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/quota`,
    );
  }
  setQuota(id: number | string, patch: QuotaInput) {
    return this.client.put<{ quota: Quota }>(`/api/v1/agents/${encodeURIComponent(String(id))}/quota`, {
      body: patch,
    });
  }

  // ---- Skills -------------------------------------------------------------
  listSkills(id: number | string) {
    return this.client.get<{ skills: Skill[] }>(`/api/v1/agents/${encodeURIComponent(String(id))}/skills`);
  }
  attachSkill(id: number | string, skill: SkillInput) {
    return this.client.post<{ skills: Skill[] }>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/skills`,
      { body: skill },
    );
  }
  detachSkill(id: number | string, name: string) {
    return this.client.delete<{ skills: Skill[] }>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/skills/${encodeURIComponent(name)}`,
    );
  }

  // ---- Koans --------------------------------------------------------------
  listKoans(id: number | string) {
    return this.client.get<AgentKoans>(`/api/v1/agents/${encodeURIComponent(String(id))}/koans`);
  }

  // ---- Reports ------------------------------------------------------------
  listReports(id: number | string) {
    return this.client.get<AgentReports>(`/api/v1/agents/${encodeURIComponent(String(id))}/reports`);
  }
  getReport(id: number | string, slug: string) {
    return this.client.get<Report>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/reports/${encodeURIComponent(slug)}`,
    );
  }
  createReport(id: number | string, input: ReportInput) {
    return this.client.post<Report>(`/api/v1/agents/${encodeURIComponent(String(id))}/reports`, {
      body: input,
    });
  }
  updateReport(id: number | string, slug: string, patch: Partial<ReportInput>) {
    return this.client.patch<Report>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/reports/${encodeURIComponent(slug)}`,
      { body: patch },
    );
  }
  deleteReport(id: number | string, slug: string) {
    return this.client.delete<{ success?: boolean }>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/reports/${encodeURIComponent(slug)}`,
    );
  }

  // ---- Deployments --------------------------------------------------------
  listDeployments(id: number | string) {
    return this.client.get<{ deployments: Deployment[] }>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/deployments`,
    );
  }
  createDeployment(id: number | string, shape: DeploymentShape) {
    return this.client.post<Deployment>(`/api/v1/agents/${encodeURIComponent(String(id))}/deployments`, {
      body: { shape },
    });
  }
  rollbackDeployment(
    id: number | string,
    deploymentId: number,
    toVersion: number,
  ) {
    return this.client.post<Deployment>(
      `/api/v1/agents/${encodeURIComponent(String(id))}/deployments/${encodeURIComponent(String(deploymentId))}/rollback`,
      { body: { toVersion } },
    );
  }
}
