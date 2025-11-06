#!/bin/sh
set -euo pipefail

KRATOS_ADMIN_URL=${KRATOS_ADMIN_URL:-http://kratos:4434}
KETO_READ_URL=${KETO_READ_URL:-http://keto:4466}
KETO_WRITE_URL=${KETO_WRITE_URL:-http://keto:4467}

ADMIN_IDENTIFIER=${PLATFORM_ADMIN_IDENTIFIER:-"+8613800000000"}
ADMIN_PASSWORD=${PLATFORM_ADMIN_PASSWORD:-"ChangeMe123!"}
ADMIN_NICKNAME=${PLATFORM_ADMIN_NICKNAME:-"平台管理员"}
ADMIN_TENANT_ID=${PLATFORM_ADMIN_TENANT_ID:-""}
ADMIN_ROLES=${PLATFORM_ADMIN_ROLES:-"platform_admin"}
ADMIN_NAMESPACE=${PLATFORM_ADMIN_NAMESPACE:-"Tenant"}

info() {
  printf '[seed-admin] %s\n' "$*"
}

wait_for() {
  local name=$1 url=$2
  info "waiting for $name at $url"
  until curl -sf "$url" >/dev/null 2>&1; do
    sleep 2
  done
}

urlencode() {
  # Minimal urlencode for identifier
  local raw="$1"
  python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1], safe=''))" "$raw"
}

ensure_python() {
  if command -v python3 >/dev/null 2>&1; then
    return
  fi
  info "installing python3 for urlencode helper"
  apk add --no-cache python3 >/dev/null 2>&1
}

ensure_tools() {
  if ! command -v curl >/dev/null 2>&1; then
    apk add --no-cache curl >/dev/null 2>&1
  fi
  if ! command -v jq >/dev/null 2>&1; then
    apk add --no-cache jq >/dev/null 2>&1
  fi
  ensure_python
}

main() {
  ensure_tools

  wait_for "Kratos admin" "$KRATOS_ADMIN_URL/health/ready"

  local encoded_identifier identity_id
  encoded_identifier=$(urlencode "$ADMIN_IDENTIFIER")

  identity_id=$(curl -sf "$KRATOS_ADMIN_URL/admin/identities?per_page=1&credentials_identifier=$encoded_identifier" |
    jq -r '.[0].id // empty')

  if [ -z "$identity_id" ]; then
    info "platform admin identity not found, creating"

    roles_json=$(jq -Rn --arg roles "$ADMIN_ROLES" '$roles | split(",") | map(select(length > 0))')
    payload=$(jq -n \
      --arg phone "$ADMIN_IDENTIFIER" \
      --arg nickname "$ADMIN_NICKNAME" \
      --arg password "$ADMIN_PASSWORD" \
      --arg user_type "internal" \
      --arg tenant "$ADMIN_TENANT_ID" \
      --argjson roles "$roles_json" '
        {
          schema_id: "portal",
          state: "active",
          traits: {
            phone: $phone,
            nickname: $nickname,
            user_type: $user_type,
            roles: (if $roles | length > 0 then $roles else ["platform_admin"] end)
          },
          credentials: {
            password: {
              config: {
                password: $password
              }
            }
          }
        } | if ($tenant | length) > 0 then (.traits.tenant_id = $tenant) else . end
      ')

    identity_id=$(curl -sf -X POST "$KRATOS_ADMIN_URL/admin/identities" \
      -H "Content-Type: application/json" \
      -d "$payload" | jq -r '.id')

    if [ -z "$identity_id" ] || [ "$identity_id" = "null" ]; then
      info "failed to create platform admin identity"
      exit 1
    fi
    info "created platform admin identity: $identity_id"
  else
    info "platform admin identity already exists: $identity_id"
  fi

  wait_for "Keto read" "$KETO_READ_URL/health/ready"

  local relation_exists relation_status relation_tmp
  relation_tmp=$(mktemp)
  relation_status=$(curl -s -o "$relation_tmp" -w "%{http_code}" \
    "$KETO_READ_URL/admin/relation-tuples?namespace=$ADMIN_NAMESPACE&object=global:platform_admin&relation=member")

  if [ "$relation_status" = "200" ]; then
    relation_exists=$(jq -r --arg identity "$identity_id" '.relation_tuples[]? | select(.subject_id == $identity) | .subject_id' "$relation_tmp")
  else
    relation_exists=""
  fi
  rm -f "$relation_tmp"

  if [ -n "$relation_exists" ]; then
    info "Keto relation already present for admin identity"
  else
    info "creating Keto relation for platform admin"
    curl -sf -X PUT "$KETO_WRITE_URL/admin/relation-tuples" \
      -H "Content-Type: application/json" \
      -d "{
        \"namespace\": \"$ADMIN_NAMESPACE\",
        \"object\": \"global:platform_admin\",
        \"relation\": \"members\",
        \"subject_id\": \"$identity_id\"
      }" >/dev/null
    info "Keto relation created"
  fi

  info "platform admin seed complete"
}

main "$@"
