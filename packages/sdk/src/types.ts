/**
 * Resource shapes returned by the Kohala public REST API.
 *
 * Known fields are typed for editor autocomplete; the trailing index signature
 * keeps every record forward-compatible, so new server fields remain readable
 * without an SDK upgrade.
 */

export interface Agent {
  id: number;
  name: string;
  description?: string | null;
  projectIndustry?: string | null;
  status?: string;
  agentEnabled?: boolean;
  agentPaused?: boolean;
  agentCharter?: string | null;
  agentToolAllowlist?: string[] | null;
  agentScheduleEnabled?: boolean;
  agentScheduleCron?: string | null;
  ownerId?: number | null;
  enterpriseId?: number | null;
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Fields accepted when creating an agent. The API also accepts short aliases
 * (`charter`, `industry`, `enabled`, ...) which map onto the canonical
 * `agent*` columns server-side.
 */
export interface AgentInput {
  name: string;
  description?: string | null;
  /** Free-form mission / scope statement (maps to `agentCharter`). */
  charter?: string | null;
  /** Project industry, e.g. "software". */
  industry?: string;
  enabled?: boolean;
  paused?: boolean;
  /** Tool ids the agent is allowed to call. */
  toolAllowlist?: string[];
  scheduleEnabled?: boolean;
  /** 5-field UTC cron string. */
  scheduleCron?: string | null;
  billingCapTokens?: number | null;
  perRunTokenCap?: number | null;
  perDayTokenCap?: number | null;
  [key: string]: unknown;
}

export type AgentUpdate = Partial<AgentInput>;

/**
 * Input for `kohala.users.create` (`POST /api/v1/users`). Requires the
 * superuser-granted "Can create users" flag on the calling account.
 */
export interface CreateUserInput {
  email: string;
  /** At least 6 characters. The created account can log in with it immediately. */
  password: string;
  /** Account tier. Circle is invitation-only and not creatable via the API. */
  tier: "personal" | "business";
  /** Required for tier "business" — the new team's name (max 100 chars). */
  teamName?: string;
  [key: string]: unknown;
}

/** A created account (sanitized — never contains hashes or tokens). */
export interface CreatedUser {
  user: {
    id: number;
    email: string;
    accountType?: string;
    verified?: boolean;
    enterpriseId?: number | null;
    [key: string]: unknown;
  };
  /** The created team (business tier only), else null. */
  enterprise: { id: number; name: string } | null;
  [key: string]: unknown;
}

export interface AgentRun {
  id: number;
  agentId?: number;
  status?: string;
  trigger?: string;
  errorMessage?: string | null;
  tokensUsed?: number | null;
  createdAt?: string;
  completedAt?: string | null;
  [key: string]: unknown;
}

export interface AgentRunList {
  runs: AgentRun[];
  total: number;
  limit: number;
  offset: number;
}

/** Rolling run-health summary. Shape is intentionally open-ended. */
export type AgentHealth = Record<string, unknown>;

export interface Quota {
  tokenCapPerRun?: number | null;
  tokenCapMonthly?: number | null;
  runCapDaily?: number | null;
  warningThresholdPct?: number | null;
  [key: string]: unknown;
}

export type QuotaInput = Partial<
  Pick<
    Quota,
    "tokenCapPerRun" | "tokenCapMonthly" | "runCapDaily" | "warningThresholdPct"
  >
>;

export interface Skill {
  name: string;
  [key: string]: unknown;
}

export type SkillInput = Record<string, unknown> & { name?: string };

export interface Koan {
  id?: number;
  slug: string;
  title?: string | null;
  published?: boolean;
  htmlContent?: string | null;
  [key: string]: unknown;
}

export interface AgentKoans {
  koans: Koan[];
  latestRun: AgentRun | null;
  agentEnabled: boolean;
  freshnessSlaSeconds: number | null;
}

export interface Report {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  tags?: string[];
  published?: boolean;
  sections?: unknown[];
  htmlContent?: string | null;
  thumbnailUrl?: string | null;
  agentId?: number | null;
  [key: string]: unknown;
}

export interface AgentReports {
  reports: Report[];
  latestRun: AgentRun | null;
  agentEnabled: boolean;
  freshnessSlaSeconds: number | null;
}

export interface ReportInput {
  title: string;
  description?: string | null;
  tags?: string[];
  sections?: unknown[];
  htmlContent?: string | null;
  thumbnailUrl?: string | null;
  published?: boolean;
}

export type DeploymentShape = "scheduled" | "webhook" | "chat" | "api_key";

export interface Deployment {
  id: number;
  shape?: string;
  version?: number;
  [key: string]: unknown;
}

export interface WorkflowGraph {
  startStepId: string;
  steps: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface WorkflowDefinition {
  id: number;
  agentId: number;
  name: string;
  description?: string | null;
  graph: WorkflowGraph;
  version?: number;
  scheduleEnabled?: boolean;
  scheduleCron?: string | null;
  ownerId?: number | null;
  enterpriseId?: number | null;
  [key: string]: unknown;
}

export interface WorkflowInput {
  agentId: number;
  name: string;
  description?: string | null;
  graph: WorkflowGraph;
  enterpriseId?: number | null;
}

export type WorkflowUpdate = Partial<{
  name: string;
  description: string | null;
  graph: WorkflowGraph;
  scheduleEnabled: boolean;
  scheduleCron: string | null;
}>;

export interface WorkflowRun {
  id: number;
  definitionId?: number;
  status?: string;
  [key: string]: unknown;
}
