import { Namespace, SubjectSet, Context } from "@ory/keto-namespace-types"

/**
 * Base namespace for identities. We currently do not model any relations on
 * users directly, but keeping the namespace explicit allows other namespaces
 * to reference individual users or subject sets derived from them.
 */
class User implements Namespace {
    related: {}
    permits = {}
}

/**
 * Groups capture the organisational structure within a tenant. Membership is
 * expressed via the `members` relation; managerial privileges are exposed via
 * the `managers` relation so that higher-level resource objects can reference
 * it through subject sets.
 */
class Group implements Namespace {
    related: {
        parents: Group[]
        members: User[]
        managers: (
            User
            | SubjectSet<Tenant, "editors">
            | SubjectSet<Tenant, "admins">
        )[]
    }

    permits = {
        view: (ctx: Context): boolean =>
            this.related.members.includes(ctx.subject) ||
            this.related.managers.includes(ctx.subject) ||
            this.related.parents.traverse((p) => p.permits.view(ctx)),


        manage: (ctx: Context): boolean =>
            this.related.managers.includes(ctx.subject) ||
            this.related.parents.traverse((p) => p.permits.manage(ctx)),
    }
}

/**
 * The Tenant namespace doubles as (1) the container for tenant-scoped roles
 * such as `tenant_admin`, and (2) the resource space that mirrors our backend
 * API objects (for example `tenant-id:api/v1/groups`). Relations like
 * `viewers`, `editors`, and `admins` are attached to the latter so we can gate
 * HTTP methods by mapping them to the appropriate relation.
 *
 * To grant a role access to an API, create a relation tuple that points the
 * resource object to the role object. Example:
 *
 *   namespace = Tenant
 *   object    = <tenant-id>:api/v1/groups
 *   relation  = editors
 *   subject   = Tenant#members(<tenant-id>:tenant_admin)
 */
class Tenant implements Namespace {
    related: {
        members: (
            User
            | SubjectSet<Group, "members">
            | SubjectSet<Group, "managers">
        )[]
        viewers: (
            User
            | SubjectSet<Tenant, "members">
            | SubjectSet<Group, "managers">
            | SubjectSet<Group, "members">
        )[]
        editors: (
            User
            | SubjectSet<Tenant, "members">
            | SubjectSet<Group, "managers">
        )[]
        admins: (
            User
            | SubjectSet<Tenant, "members">
        )[]
    }

    permits = {
        GET: (ctx: Context): boolean =>
            this.related.viewers.includes(ctx.subject) ||
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        HEAD: (ctx: Context): boolean =>
            this.related.viewers.includes(ctx.subject) ||
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        OPTIONS: (ctx: Context): boolean =>
            this.related.viewers.includes(ctx.subject) ||
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        POST: (ctx: Context): boolean =>
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        PUT: (ctx: Context): boolean =>
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        PATCH: (ctx: Context): boolean =>
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        DELETE: (ctx: Context): boolean =>
            this.related.admins.includes(ctx.subject),

        // Fallback when the relation defaults to "can"
        can: (ctx: Context): boolean =>
            this.related.viewers.includes(ctx.subject) ||
            this.related.editors.includes(ctx.subject) ||
            this.related.admins.includes(ctx.subject),

        // Keeps backwards compatibility with callers that check membership
        member: (ctx: Context): boolean =>
            this.related.members.includes(ctx.subject),
    }
}

/**
 * Generic resource namespace for non-API objects (documents, assets, etc.).
 * This remains available for future use and mirrors the traditional
 * owners/viewers/editors pattern.
 */
class Resource implements Namespace {
    related: {
        owners: User[]
        viewers: (User | SubjectSet<Tenant, "viewers"> | SubjectSet<Group, "members">)[]
        editors: (User | SubjectSet<Tenant, "editors"> | SubjectSet<Group, "managers">)[]
    }

    permits = {
        view: (ctx: Context): boolean =>
            this.related.viewers.includes(ctx.subject) ||
            this.related.editors.includes(ctx.subject) ||
            this.related.owners.includes(ctx.subject),

        edit: (ctx: Context): boolean =>
            this.related.editors.includes(ctx.subject) ||
            this.related.owners.includes(ctx.subject),
    }
}

