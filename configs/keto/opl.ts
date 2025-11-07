import { Namespace, SubjectSet, Context } from "@ory/keto-namespace-types"

class User implements Namespace {
  related: {}
  permits = {}
}

class Group implements Namespace {
  related: {
    parents: Group[]
    members: (User | SubjectSet<Group, "members"> | SubjectSet<Tenant, "members"> | SubjectSet<Tenant, "editors"> | SubjectSet<Tenant, "admins">)[]
    managers: (User | SubjectSet<Group, "managers"> | SubjectSet<Tenant, "members"> | SubjectSet<Tenant, "editors"> | SubjectSet<Tenant, "admins">)[]
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

class Tenant implements Namespace {
  related: {
    members: (User | SubjectSet<Group, "members"> | SubjectSet<Group, "managers">)[]
    viewers: (User | SubjectSet<Tenant, "members"> | SubjectSet<Group, "managers"> | SubjectSet<Group, "members">)[]
    editors: (User | SubjectSet<Tenant, "members"> | SubjectSet<Group, "managers">)[]
    admins: (User | SubjectSet<Tenant, "members">)[]
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

    can: (ctx: Context): boolean =>
      this.related.viewers.includes(ctx.subject) ||
      this.related.editors.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject),

    member: (ctx: Context): boolean =>
      this.related.members.includes(ctx.subject),
  }
}

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
