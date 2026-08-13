import type { Kohala } from "../client";
import type { CreatedUser, CreateUserInput } from "../types";

/**
 * Programmatic account creation (`POST /api/v1/users`).
 *
 * Requires the superuser-granted "Can create users" flag on the account that
 * owns the API key (superusers are implicitly allowed) — ungranted callers
 * receive a 403. Created accounts are born verified and can log in with the
 * supplied password immediately; no verification email is sent.
 */
export class UsersResource {
  constructor(private readonly client: Kohala) {}

  /**
   * Create a personal- or business-tier account. Business tier requires a
   * `teamName` and creates a new team (30-day trial) with the created user
   * as its first member. Circle tier is invitation-only and not creatable.
   */
  create(input: CreateUserInput) {
    return this.client.post<CreatedUser>("/api/v1/users", { body: input });
  }
}
