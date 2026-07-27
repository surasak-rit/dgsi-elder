---
title: คู่มือติดตั้งและตั้งค่า CI/CD (Setup & Configuration Guide)
tags:
  - dgsi/runbook
  - service/platform
  - service/devops
  - governance/procedure
aliases:
  - CI/CD Setup Guide
  - GitLab Runner Harbor Fleet Setup
  - คู่มือติดตั้ง CI/CD
  - DevSecOps Runbook
created: 2026-07-24
status: draft
---

# 🛠️ คู่มือติดตั้งและตั้งค่า CI/CD (Setup & Configuration Guide)

> ส่วนหนึ่งของ [[00 - ภาพรวมศูนย์ฯ (MOC)]] — คู่ปฏิบัติของ [[12 - สถาปัตยกรรม CI-CD ภายในองค์กร (Internal CI-CD Pipeline)]]: เอกสาร 12 คือ**พิมพ์เขียว (ทำไม/อะไร)** ส่วนเอกสารนี้คือ **runbook ลงมือทำจริง (ทำอย่างไร)** ทีละขั้นพร้อมคำสั่งและ YAML

> [!info] เอกสารนี้คืออะไร
> คู่มือติดตั้งและตั้งค่า CI/CD ตามที่ออกแบบไว้ในเอกสาร 12 บน **GitLab CE + Harbor + Rancher/K8s** — ครอบคลุม 9 ขั้นตอน: ติดตั้ง Runner → ตั้งค่า Harbor → ผูก credential → ป้องกัน branch/env → template pipeline กลาง → GitOps ด้วย Fleet → จัดการ secret ด้วย Sealed Secrets → ลงลายเซ็นและบังคับตรวจด้วย Cosign+Kyverno → ทดสอบ end-to-end

> [!warning] ก่อนเริ่ม — ค่าที่ต้องแทนที่
> ทุกคำสั่ง/ไฟล์ในเอกสารนี้ใช้ค่าตัวอย่าง ให้แทนที่ตามจริงก่อนใช้:
> `gitlab.local` (โดเมน GitLab) · `harbor.local` (โดเมน Harbor) · `dgsi` (ชื่อ Harbor project/กลุ่ม) · `dgsi-dev/staging/prod` (namespace) · โทเคน/รหัสผ่านทั้งหมดเก็บใน vault ไม่ commit ลง Git

---

## 🗺️ ลำดับการติดตั้ง (Installation Order)

```mermaid
graph TD
    P0["0 · Prerequisites<br/>ตรวจ GitLab/Harbor/Rancher พร้อม"] --> S1["1 · ติดตั้ง GitLab Runner<br/>(K8s executor)"]
    S1 --> S2["2 · ตั้งค่า Harbor<br/>project + robot + scan"]
    S2 --> S3["3 · ผูก CI/CD Variables<br/>ใน GitLab"]
    S3 --> S4["4 · Protected branch/env"]
    S4 --> S5["5 · Template .gitlab-ci.yml กลาง"]
    S5 --> S6["6 · GitOps ด้วย Fleet"]
    S6 --> S7["7 · Sealed Secrets"]
    S7 --> S8["8 · Cosign + Kyverno verify"]
    S8 --> S9["9 · ทดสอบ End-to-End"]
```

> [!note] Prerequisites ที่ต้องมีก่อน
> - GitLab CE เข้าถึงได้ + สิทธิ์ Owner/Maintainer ในกลุ่ม/โปรเจกต์
> - Harbor เข้าถึงได้ + สิทธิ์ admin (สร้าง project/robot)
> - Rancher จัดการ cluster ปลายทางได้ + `kubectl` ต่อ cluster ได้ + Helm 3
> - DNS/TLS ของ `gitlab.local`, `harbor.local` ใช้งานได้ (แนะนำ cert-manager)

---

## 1️⃣ ติดตั้ง GitLab Runner (Kubernetes Executor)

> GitLab CE **ไม่แถม Runner** — ต้องติดตั้งเองอย่างน้อย 1 ตัว มิฉะนั้น pipeline จะค้าง `pending` ในบริบทที่มี K8s อยู่แล้ว ให้ลงแบบ **Kubernetes executor** (แต่ละ job = pod ชั่วคราว สร้าง-รัน-ลบ)

**ขั้นตอน**

1. หา **registration token** ที่ GitLab → กลุ่ม/โปรเจกต์ → **Settings → CI/CD → Runners** (แนะนำ *group runner* เพื่อใช้ร่วมหลายโปรเจกต์)
2. ติดตั้งด้วย Helm ลง namespace เฉพาะ:

```bash
helm repo add gitlab https://charts.gitlab.io
helm repo update
kubectl create namespace gitlab-runner
```

`values.yaml` (ตัวอย่างย่อ):

```yaml
gitlabUrl: https://gitlab.local/
runnerRegistrationToken: "<REGISTRATION_TOKEN>"   # หรือใช้ existingSecret

concurrent: 10                # จำนวน job พร้อมกันสูงสุด
rbac:
  create: true

runners:
  config: |
    [[runners]]
      [runners.kubernetes]
        namespace = "gitlab-runner"
        image = "alpine:3.20"
        # จำกัดทรัพยากรต่อ job (กัน job แย่ง cluster)
        cpu_request = "200m"
        memory_request = "256Mi"
        cpu_limit = "1"
        memory_limit = "1Gi"
        # ไม่ใช้ privileged — เรา build ด้วย Kaniko ไม่ใช่ docker-in-docker
        privileged = false
```

```bash
helm install gitlab-runner gitlab/gitlab-runner \
  -n gitlab-runner -f values.yaml
```

3. ตรวจว่า Runner ขึ้นสถานะ online ที่ **Settings → CI/CD → Runners**

> [!tip] แยก Runner ตามความเสี่ยง
> พิจารณาแยก runner คนละชุด/คนละ tag สำหรับงาน prod กับงานทั่วไป และตั้ง **tag** ให้ job production เลือก runner ที่ควบคุมเข้มกว่า — สอดคล้องหลักลดความเสี่ยง runner ถูกยึดใน [[12 - สถาปัตยกรรม CI-CD ภายในองค์กร (Internal CI-CD Pipeline)#⚠️ ความเสี่ยงและการรับมือ\|ความเสี่ยงเอกสาร 12]]

---

## 2️⃣ ตั้งค่า Harbor (Project + Robot + Scan Policy)

**2.1 สร้าง Project**
- สร้าง project `dgsi` (Private) สำหรับ image ของทีม
- สร้าง project `library` สำหรับ **base image ที่อนุมัติแล้ว** และตั้งเป็น **Proxy Cache** ชี้ไป Docker Hub/registry ต้นทาง เพื่อสแกนก่อนใช้จริง

**2.2 เปิดสแกนช่องโหว่ (Trivy)**
- Project `dgsi` → **Configuration** → ติ๊ก **"Automatically scan images on push"**
- ติ๊ก **"Prevent vulnerable images from running"** → เลือกระดับ **Critical** (บล็อก pull ถ้าเจอ)
- ตั้ง scheduled rescan (Administration → Interrogation Services) เช่น รายวัน เพื่อจับ CVE ใหม่

**2.3 Retention + Immutability + Quota**
- **Tag Retention:** เก็บ N tag ล่าสุด + ลบ untagged ตามรอบ
- **Tag Immutability:** ตั้งกฎให้ tag รูปแบบ release (`v*`) เขียนทับไม่ได้
- **Quota:** ตั้งเพดานพื้นที่ต่อ project

**2.4 สร้าง Robot Account (แยก push / pull)**
- `robot$dgsi+ci-push` → สิทธิ์ **push + pull** (ให้ GitLab CI ใช้)
- `robot$dgsi+k8s-pull` → สิทธิ์ **pull** อย่างเดียว (ให้ cluster ดึง image)
- คัดลอก secret ของ robot ไปเก็บใน vault → ใช้ในขั้นตอนที่ 3 และ 6

> [!warning] อย่าใช้บัญชีบุคคลใน pipeline
> pipeline และ cluster ต้องใช้ **robot account** เท่านั้น — เพิกถอนได้โดยไม่กระทบบัญชีคน และจำกัดสิทธิ์ต่อ project ได้ (least privilege)

---

## 3️⃣ ผูก CI/CD Variables ใน GitLab

ไปที่ **Settings → CI/CD → Variables** เพิ่มตัวแปร (ตั้ง **Masked** และ **Protected** ให้เห็นเฉพาะ protected branch/env):

| Key | ค่า | Masked | Protected |
|-----|-----|:------:|:---------:|
| `HARBOR_USER` | `robot$dgsi+ci-push` | ✅ | ✅ |
| `HARBOR_PASSWORD` | secret ของ robot push | ✅ | ✅ |
| `HARBOR_REGISTRY` | `harbor.local` | — | — |
| `COSIGN_PRIVATE_KEY` | คีย์ลับ Cosign (ขั้นตอน 8) | ✅ | ✅ |
| `COSIGN_PASSWORD` | รหัสผ่านคีย์ Cosign | ✅ | ✅ |

> [!warning] อย่าเก็บ secret ในโค้ด
> ห้าม hardcode รหัสผ่าน/โทเคนใน `.gitlab-ci.yml` หรือ repo — ใช้ CI/CD Variables เท่านั้น และเปิด **secret detection** (ขั้นตอน 5) เพื่อจับกรณีหลุด

---

## 4️⃣ Protected Branch และ Protected Environment

**4.1 Protected Branch** (**Settings → Repository → Protected branches**)
- `main`: Allowed to merge = *Maintainers* · Allowed to push = *No one* (บังคับผ่าน MR)
- เปิด **Settings → Merge requests**: require pipeline succeed + require approval ≥ 1 + ห้ามผู้เขียนอนุมัติ MR ตัวเอง

**4.2 Protected Environment** (**Settings → CI/CD → Protected environments**)
- ป้องกัน environment ชื่อ `production` → allowed to deploy = เฉพาะกลุ่มผู้อนุมัติ (แยกจากผู้พัฒนา)
- ทำให้ job deploy prod ต้อง **manual + อนุมัติ** เท่านั้น

> [!note] ชดเชยข้อจำกัด GitLab CE
> CE ไม่มี multi-level MR approval แบบ EE — ให้ใช้ **protected environment + manual gate + GitOps** (เอกสารนี้) แทนกลไก approval ของ EE เพื่อรักษาการแยกหน้าที่ (SoD)

---

## 5️⃣ Template `.gitlab-ci.yml` กลาง (Reusable)

สร้าง repo กลาง เช่น `dgsi/ci-templates` แล้วให้ทุกโปรเจกต์ `include` เพื่อมาตรฐานเดียวกัน

**`ci-templates/pipeline.yml`** (แม่แบบกลาง):

```yaml
stages: [test, scan, package, deploy]

variables:
  IMAGE: $HARBOR_REGISTRY/dgsi/$CI_PROJECT_NAME
  TAG: $CI_COMMIT_SHORT_SHA

# ---- ทดสอบ ----
.unit-test:
  stage: test
  script: [ "make test" ]
  coverage: '/coverage: \d+\.\d+/'

# ---- สแกนโค้ด/dependency/secret ----
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml

# ---- build image ด้วย Kaniko (ไม่ต้อง docker daemon) ----
.build-image:
  stage: package
  image:
    name: gcr.io/kaniko-project/executor:v1.23.0-debug
    entrypoint: [""]
  script:
    - mkdir -p /kaniko/.docker
    - |
      echo "{\"auths\":{\"$HARBOR_REGISTRY\":{\"auth\":\"$(printf '%s:%s' "$HARBOR_USER" "$HARBOR_PASSWORD" | base64 | tr -d '\n')\"}}}" > /kaniko/.docker/config.json
    - /kaniko/executor
        --context "$CI_PROJECT_DIR"
        --dockerfile "$CI_PROJECT_DIR/Dockerfile"
        --destination "$IMAGE:$TAG"
        --digest-file=/tmp/digest
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

# ---- อัปเดต tag ลง manifest repo → Fleet ไป sync ต่อ ----
.deploy-dev:
  stage: deploy
  image: alpine/git
  script:
    - git clone https://oauth2:${MANIFEST_TOKEN}@gitlab.local/dgsi/gitops.git
    - cd gitops
    - sed -i "s|tag:.*|tag: \"$TAG\"|" apps/$CI_PROJECT_NAME/dev/values.yaml
    - git commit -am "deploy dev $CI_PROJECT_NAME:$TAG" && git push
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

**ในโปรเจกต์ปลายทาง** ใช้แค่:

```yaml
include:
  - project: 'dgsi/ci-templates'
    file: '/pipeline.yml'

unit-test: { extends: .unit-test }
build:     { extends: .build-image }
deploy-dev:{ extends: .deploy-dev }
```

> [!tip] แยก CI ออกจาก CD
> สังเกตว่า pipeline **ไม่ยิง `kubectl`** — แค่แก้ tag ใน manifest repo แล้วให้ **Fleet** (ขั้นตอน 6) เป็นตัว deploy จริง ตามหลัก "แยก CI/CD" ในเอกสาร 12

---

## 6️⃣ GitOps ด้วย Fleet (มากับ Rancher)

**6.1 โครงสร้าง manifest repo** (`dgsi/gitops`):

```
gitops/
├── apps/
│   └── <service>/
│       ├── base/                 # Helm chart หรือ kustomize base
│       ├── dev/values.yaml       # tag ถูกแก้โดย CI
│       ├── staging/values.yaml
│       └── prod/values.yaml
└── fleet.yaml                    # บอก Fleet ว่า deploy อะไร ไป cluster/namespace ไหน
```

**6.2 `fleet.yaml`** (แมป path → namespace):

```yaml
defaultNamespace: dgsi-dev
helm:
  releaseName: my-service
targetCustomizations:
  - name: staging
    clusterSelector:
      matchLabels: { env: staging }
    helm:
      valuesFiles: [ "staging/values.yaml" ]
    namespace: dgsi-staging
  - name: prod
    clusterSelector:
      matchLabels: { env: prod }
    helm:
      valuesFiles: [ "prod/values.yaml" ]
    namespace: dgsi-prod
```

**6.3 ลงทะเบียน GitRepo กับ Fleet** — ที่ Rancher UI (**Continuous Delivery → Git Repos → Add**) หรือ apply CRD:

```yaml
apiVersion: fleet.cattle.io/v1alpha1
kind: GitRepo
metadata:
  name: dgsi-apps
  namespace: fleet-default
spec:
  repo: https://gitlab.local/dgsi/gitops.git
  branch: main
  paths:
    - apps
  # อ่าน private repo ผ่าน secret (deploy token ของ GitLab)
  clientSecretName: gitlab-auth
```

Fleet จะ **watch repo → sync อัตโนมัติ** เมื่อ CI แก้ tag และตรวจ/แก้ **drift** ให้เอง

> [!example] Rollback
> rollback = `git revert` commit ที่เปลี่ยน tag แล้ว push — Fleet จะ sync สถานะกลับให้ มีร่องรอยครบใน git log (ไม่ต้องแตะ cluster ด้วยมือ)

---

## 7️⃣ จัดการ Secret ด้วย Sealed Secrets

> เก็บ secret ที่ **เข้ารหัสแล้ว** ลง Git ได้อย่างปลอดภัย ถอดรหัสได้เฉพาะใน cluster (controller ถือคีย์ส่วนตัว)

**7.1 ติดตั้ง controller:**

```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets \
  -n kube-system
# ติดตั้ง CLI kubeseal บนเครื่องผู้ดูแล (ดาวน์โหลด binary ตามเวอร์ชัน)
```

**7.2 สร้าง SealedSecret แล้ว commit ลง manifest repo:**

```bash
# สร้าง Secret ปกติ (ยังไม่ apply) แล้วแปลงเป็น SealedSecret
kubectl create secret generic db-cred \
  --from-literal=password='S3cr3t!' \
  --namespace dgsi-prod --dry-run=client -o yaml \
| kubeseal --format yaml > apps/my-service/prod/db-cred-sealed.yaml

# ปลอดภัยที่จะ commit — ถอดได้เฉพาะใน cluster เท่านั้น
git add apps/my-service/prod/db-cred-sealed.yaml && git commit -m "add sealed secret"
```

**7.3 สร้าง imagePullSecret ให้ cluster ดึง image จาก Harbor** (robot pull):

```bash
kubectl create secret docker-registry harbor-pull \
  --docker-server=harbor.local \
  --docker-username='robot$dgsi+k8s-pull' \
  --docker-password='<ROBOT_PULL_SECRET>' \
  -n dgsi-prod --dry-run=client -o yaml \
| kubeseal --format yaml > apps/_shared/prod/harbor-pull-sealed.yaml
```

> [!warning] อย่า commit Secret ดิบ
> commit ได้เฉพาะไฟล์ `*-sealed.yaml` เท่านั้น — Secret ต้นฉบับ (plaintext/base64) ห้ามเข้า Git เด็ดขาด (secret-detection ในขั้นตอน 5 จะช่วยจับ)

---

## 8️⃣ ลงลายเซ็น Image (Cosign) + บังคับตรวจ (Kyverno)

**8.1 สร้างคู่กุญแจ Cosign** (เก็บ private key ใน CI Variable ขั้นตอน 3, public key ไว้ให้ cluster ตรวจ):

```bash
cosign generate-key-pair          # ได้ cosign.key (ลับ) + cosign.pub (สาธารณะ)
```

**8.2 เพิ่ม job ลงลายเซ็นใน pipeline** (ต่อจาก build):

```yaml
sign-image:
  stage: package
  image: gcr.io/projectsigstore/cosign:v2.4.0
  script:
    - echo "$COSIGN_PRIVATE_KEY" > /tmp/cosign.key
    - cosign sign --key /tmp/cosign.key --yes "$IMAGE:$TAG"
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

**8.3 บังคับให้ cluster รับเฉพาะ image ที่มีลายเซ็น** (ด้วย Kyverno policy):

```bash
helm repo add kyverno https://kyverno.github.io/kyverno/
helm install kyverno kyverno/kyverno -n kyverno --create-namespace
```

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-signed-images
spec:
  validationFailureAction: Enforce      # ปฏิเสธ pod ที่ image ไม่มีลายเซ็น
  rules:
    - name: verify-dgsi-images
      match:
        any:
          - resources: { kinds: [ Pod ] }
      verifyImages:
        - imageReferences: [ "harbor.local/dgsi/*" ]
          attestors:
            - entries:
                - keys:
                    publicKeys: |-
                      -----BEGIN PUBLIC KEY-----
                      <เนื้อหา cosign.pub>
                      -----END PUBLIC KEY-----
```

> [!tip] ปิดวงจร Supply Chain
> เมื่อครบ 3 ชั้นนี้ — Harbor บล็อก Critical + Cosign ลงลายเซ็น + Kyverno บังคับตรวจก่อนรัน — จะได้ตามเป้า "% image ที่มีลายเซ็น = 100%" และ "Critical CVE ขึ้น prod = 0" ใน [[12 - สถาปัตยกรรม CI-CD ภายในองค์กร (Internal CI-CD Pipeline)#📈 ตัวชี้วัดและ SLA (DORA Metrics)\|DORA metrics เอกสาร 12]]

---

## 9️⃣ ทดสอบ End-to-End (Smoke Test)

ไล่ทดสอบทั้งสายว่าเชื่อมกันจริง:

```mermaid
graph LR
    C["commit → main"] --> P["pipeline เขียว"] --> H["image + ลายเซ็น ใน Harbor"] --> M["CI แก้ tag ใน gitops repo"] --> F["Fleet sync"] --> R["pod รันใน dgsi-dev"]
```

| # | ทดสอบ | คาดหวัง |
|---|-------|---------|
| 1 | push โค้ดขึ้น `feature/*` | รัน lint/test/build ไม่ push image |
| 2 | เปิด MR → `main` | pipeline เต็ม + สแกน · merge ไม่ได้ถ้าแดง/ไม่มี reviewer |
| 3 | merge เข้า `main` | image `dgsi/<svc>:<sha>` โผล่ใน Harbor + มีผลสแกน + ลายเซ็น |
| 4 | ดู gitops repo | มี commit แก้ `tag` โดย CI อัตโนมัติ |
| 5 | ดู Rancher → Continuous Delivery | GitRepo `dgsi-apps` สถานะ Active/synced |
| 6 | `kubectl get pods -n dgsi-dev` | pod รันด้วย image tag ใหม่ |
| 7 | ลองสร้าง image ที่มี Critical CVE | Harbor **บล็อก** ไม่ให้ deploy |
| 8 | ลอง deploy image ที่ไม่มีลายเซ็น | Kyverno **ปฏิเสธ** pod |
| 9 | ลอง `git revert` tag | Fleet sync กลับเวอร์ชันก่อนหน้า (rollback) |

---

## 🩺 Runbook แก้ปัญหาที่พบบ่อย (Troubleshooting)

| อาการ | สาเหตุที่พบบ่อย | วิธีแก้ |
|-------|----------------|--------|
| Pipeline ค้าง `pending` | ไม่มี Runner online / tag ไม่ตรง | ตรวจ Runner ขั้นตอน 1 · เช็ก tag ของ job |
| Kaniko push ไม่ได้ (`401/403`) | credential robot ผิด/หมดสิทธิ์ | ตรวจ `HARBOR_USER/PASSWORD` เป็น robot push · สิทธิ์ project |
| Harbor block ตอน pull | เจอ Critical CVE ตามนโยบาย | แก้/อัปเดต base image · ดูรายงานสแกน · ไม่ปิดนโยบายเพื่อดันขึ้น |
| Fleet ไม่ sync | อ่าน repo ไม่ได้ / path ผิด | ตรวจ `clientSecretName` (deploy token) · path ใน GitRepo/fleet.yaml |
| Pod ถูกปฏิเสธ (Kyverno) | image ไม่มีลายเซ็น/คีย์ไม่ตรง | ตรวจ job `sign-image` · public key ใน policy ตรงกับ private key ที่ลงนาม |
| Pod `ImagePullBackOff` | ไม่มี imagePullSecret | ตรวจ `harbor-pull` secret (ขั้นตอน 7.3) ใน namespace นั้น |

---

## ✅ เช็กลิสต์ติดตั้งเสร็จ (Setup Definition of Done)

- [ ] GitLab Runner (K8s executor) online และรัน job ได้ (ไม่ privileged)
- [ ] Harbor: project `dgsi` + `library` proxy-cache · scan-on-push + block Critical · retention/quota
- [ ] Robot account แยก `ci-push` / `k8s-pull` และเก็บ secret ใน vault
- [ ] CI/CD Variables ครบ (masked + protected)
- [ ] `main` protected · MR ต้อง pipeline เขียว + reviewer ≥ 1 · production เป็น protected environment
- [ ] Template `.gitlab-ci.yml` กลางใช้งานได้ และโปรเจกต์ include ได้
- [ ] Fleet ลงทะเบียน GitRepo และ sync `dgsi-dev` สำเร็จ
- [ ] Sealed Secrets controller ทำงาน · secret ทั้งหมดอยู่ในรูป `*-sealed.yaml`
- [ ] Cosign ลงลายเซ็นใน pipeline · Kyverno บังคับ verify (Enforce)
- [ ] ผ่าน smoke test ทั้ง 9 ข้อ และจัดทำ runbook rollback แล้ว

> [!note] เชื่อมกลับธรรมาภิบาล
> เมื่อติดตั้งครบ ให้บันทึกความเสี่ยงคงเหลือใน [[เครื่องมือ/T04 - ทะเบียนความเสี่ยงข้อมูล (Data Risk Register)\|T04]] · ผูกขั้นตอนตอบสนอง deploy ล้ม/เหตุความปลอดภัยกับ [[เครื่องมือ/T08 - แบบบันทึกและตอบสนองเหตุข้อมูลรั่วไหล (Data Incident Report)\|T08]] · และป้อน DORA metrics เข้า [[เครื่องมือ/T09 - แดชบอร์ดติดตาม KPI (KPI Tracker)\|T09]] ตามเอกสาร 12
