#!/bin/sh
set -euo pipefail

python3 <<'PY'
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

KRATOS_ADMIN_URL = os.environ.get("KRATOS_ADMIN_URL", "http://kratos:4434")
KETO_READ_URL = os.environ.get("KETO_READ_URL", "http://keto:4466")
KETO_WRITE_URL = os.environ.get("KETO_WRITE_URL", "http://keto:4467")

ADMIN_IDENTIFIER = os.environ.get("PLATFORM_ADMIN_IDENTIFIER", "+8613800000000")
ADMIN_PASSWORD = os.environ.get("PLATFORM_ADMIN_PASSWORD", "ChangeMe123!")
ADMIN_NICKNAME = os.environ.get("PLATFORM_ADMIN_NICKNAME", "平台管理员")
ADMIN_TENANT_ID = os.environ.get("PLATFORM_ADMIN_TENANT_ID", "")
ADMIN_ROLES = os.environ.get("PLATFORM_ADMIN_ROLES", "platform_admin")
ADMIN_NAMESPACE = os.environ.get("PLATFORM_ADMIN_NAMESPACE", "Tenant")

def info(message: str) -> None:
    print(f"[seed-admin] {message}", flush=True)

def wait_for(name: str, url: str, timeout: int = 600, interval: float = 2.0) -> None:
    info(f"waiting for {name} at {url}")
    start = time.time()
    while True:
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                if 200 <= resp.status < 300:
                    return
        except Exception:
            pass
        if time.time() - start > timeout:
            info(f"timed out waiting for {name}")
            sys.exit(1)
        time.sleep(interval)

def http_request(method: str, url: str, body: dict | None = None, headers: dict | None = None) -> tuple[int, str]:
    data = None
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=req_headers, method=method.upper())
    try:
        with urllib.request.urlopen(request, timeout=10) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode("utf-8")
    except urllib.error.URLError as err:
        return 599, str(err)

def get_identity_id(encoded_identifier: str) -> str | None:
    url = f"{KRATOS_ADMIN_URL}/admin/identities?per_page=1&credentials_identifier={encoded_identifier}"
    status, payload = http_request("GET", url)
    if status != 200:
        info(f"failed to query identities: HTTP {status}")
        return None
    try:
        items = json.loads(payload)
    except json.JSONDecodeError:
        info("failed to decode identities response")
        return None
    if isinstance(items, list) and items:
        first = items[0]
        if isinstance(first, dict):
            return first.get("id")
    return None

def create_identity(encoded_identifier: str) -> str | None:
    roles = [r.strip() for r in ADMIN_ROLES.split(",") if r.strip()]
    if not roles:
        roles = ["platform_admin"]
    payload = {
        "schema_id": "portal",
        "state": "active",
        "traits": {
            "phone": ADMIN_IDENTIFIER,
            "nickname": ADMIN_NICKNAME,
            "user_type": "internal",
            "roles": roles,
        },
        "credentials": {
            "password": {
                "config": {
                    "password": ADMIN_PASSWORD,
                }
            }
        }
    }
    if ADMIN_TENANT_ID:
        payload["traits"]["tenant_id"] = ADMIN_TENANT_ID

    status, response = http_request(
        "POST",
        f"{KRATOS_ADMIN_URL}/admin/identities",
        body=payload,
    )
    if status not in (200, 201):
        info(f"failed to create identity: HTTP {status} {response}")
        return None
    try:
        data = json.loads(response)
    except json.JSONDecodeError:
        info("failed to decode identity creation response")
        return None
    identity_id = data.get("id")
    if not identity_id:
        info("identity creation response missing id")
        return None
    info(f"created platform admin identity: {identity_id}")
    return identity_id

def ensure_keto_relation(identity_id: str) -> None:
    url = f"{KETO_READ_URL}/admin/relation-tuples?namespace={urllib.parse.quote(ADMIN_NAMESPACE)}&object=global:platform_admin&relation=members"
    status, payload = http_request("GET", url)
    if status == 200:
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            data = {}
        tuples = data.get("relation_tuples") or []
        for entry in tuples:
            if entry.get("subject_id") == identity_id:
                info("Keto relation already present for admin identity")
                return
    payload = {
        "namespace": ADMIN_NAMESPACE,
        "object": "global:platform_admin",
        "relation": "members",
        "subject_id": identity_id,
    }
    status, response = http_request("PUT", f"{KETO_WRITE_URL}/admin/relation-tuples", body=payload)
    if status not in (200, 201, 204):
        info(f"failed to create Keto relation: HTTP {status} {response}")
        sys.exit(1)
    info("Keto relation created")

def main() -> None:
    wait_for("Kratos admin", f"{KRATOS_ADMIN_URL}/health/ready")
    encoded_identifier = urllib.parse.quote(ADMIN_IDENTIFIER, safe="")

    identity_id = get_identity_id(encoded_identifier)
    if identity_id:
        info(f"platform admin identity already exists: {identity_id}")
    else:
        info("platform admin identity not found, creating")
        identity_id = create_identity(encoded_identifier)
        if not identity_id:
            info("failed to create platform admin identity")
            sys.exit(1)

    wait_for("Keto read", f"{KETO_READ_URL}/health/ready")
    ensure_keto_relation(identity_id)
    info("platform admin seed complete")

if __name__ == "__main__":
    main()
PY
