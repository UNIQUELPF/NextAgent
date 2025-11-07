# NextAgent Portal Helm Chart

This chart deploys the full portal stack (Postgres, Kratos, Keto, Oathkeeper, backend, frontend) on Kubernetes.  It mirrors the existing Docker Compose topology and adds the supporting database migrations and ingress.

## Prerequisites

- Kubernetes 1.25+
- Helm 3.9+
- Container images for the backend/frontend and the custom Kratos build pushed to a registry accessible by the cluster
- DNS record for the public host (defaults to `portal.local`) pointing to the ingress controller

## Key Values

- `global.publicHost`, `global.publicProtocol`: external URL that users visit.  Update both along with `ingress.hosts` to match your domain.
- `global.imageRegistry` / `global.imagePullSecrets`: set if images are in a private registry.
- `postgres.*`: embedded single-instance Postgres with an init script that seeds `portal`, `kratos`, and `keto` databases.
- `kratos.courier.smsUrl`: change or disable if SMS delivery differs from the local mock.
- `migrations.enabled`: keeps the migration jobs (enabled by default).
- `seedAdmin.*`: controls the post-install hook that seeds the platform admin user via Kratos/Keto (defaults to enabled and uses the same script as docker-compose).
- `ingress.*`: configure annotations/class/hosts. When you only have an IP (no domain), leave `hosts[].host` empty so the rule matches all host headers.

## Deployment Steps

1. Build and push images (or configure `global.imageRegistry`/`imagePullSecrets`).
2. Review and override defaults:
   ```bash
   helm show values ./helm/portal > portal-values.yaml
   # edit portal-values.yaml (publicHost, TLS, image tags, secrets, etc.)
   ```
3. Create a namespace if desired: `kubectl create namespace portal`.
4. Install the chart:
   ```bash
   helm install portal ./helm/portal \
     --namespace portal \
     -f portal-values.yaml
   ```
   Helm deploys the StatefulSets/Deployments first, then runs the post-install migration Jobs followed by the seed-admin Job. A single ingress exposes the Oathkeeper proxy; Kratos admin stays cluster-internal.
5. Verify pods and jobs:
   ```bash
   kubectl get pods -n portal
   kubectl get jobs -n portal
   ```
6. Point your browser at `http(s)://<public host>` once DNS and TLS (if configured) propagate.

## Notes

- The chart keeps configuration files inline (Kratos, Oathkeeper, backend) but they are templated so internal service URLs automatically follow the release name.
- The Postgres StatefulSet uses the init SQL from `configs/postgres/init.sql`.  Update that file or supply your own if database names or credentials change.
- Migration ConfigMaps are rendered from the repository SQL files.  If you add migrations, re-run `helm upgrade` to propagate them.
- Helm CLI is not bundled in this workspace, so run `helm template`/`helm lint` locally before deploying to a real cluster.
