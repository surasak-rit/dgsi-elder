---
title: สถาปัตยกรรมบูรณาการข้อมูลและบริการ API (Data Integration & API Services)
tags:
  - dgsi/architecture
  - service/platform
  - service/integration
  - governance/policy
aliases:
  - Data Integration Architecture
  - Central Database & API
  - สถาปัตยกรรมบูรณาการข้อมูล
  - SVC-04 Architecture
created: 2026-06-16
status: draft
---

# 🔌 สถาปัตยกรรมบูรณาการข้อมูลและบริการ API

> ส่วนหนึ่งของ [[00 - ภาพรวมศูนย์ฯ (MOC)]] — ลงลึก **สถานะปัจจุบัน** ของบริการ [[04 - แคตตาล็อกงานและบริการ#📋 แคตตาล็อกบริการ (Service Catalog)\|SVC-04 บริการข้อมูลกลาง/Data Warehouse]] ในมุมเทคนิค: ทีมเชื่อมข้อมูลจาก**ระบบต้นทาง** → รวมเป็น**ฐานข้อมูลกลาง** → เปิด**บริการผ่าน REST API** ให้ระบบที่พัฒนาขึ้นเอง

> [!info] เอกสารนี้คืออะไร
> เอกสารบันทึก **สถาปัตยกรรมที่ใช้งานจริง ณ ปัจจุบัน** ของสายงานบูรณาการข้อมูล (Data Integration) — ครอบคลุม 4 ชั้น: **(1) แหล่งต้นทาง → (2) การนำเข้า (Ingestion) → (3) ฐานข้อมูลกลาง → (4) ชั้นบริการ API** พร้อมวางทับด้วย**ธรรมาภิบาล** (PDPA, ชั้นความลับ, สิทธิ์เข้าถึง, lineage, คุณภาพ) ให้สอดคล้องกับกรอบของศูนย์ฯ และระบุ **ช่องว่าง (gap) ที่ต้องปิด** เพื่อยกระดับเป็น Trusted Data Platform

> [!note] ความสัมพันธ์กับเอกสาร 10 (OpenMetadata)
> เอกสาร [[10 - แผนบูรณาการ OpenMetadata (Data Catalog)]] เคยตั้งข้อสมมติว่า "ยังไม่มี DW กลางครบทุกระบบ" — เอกสารนี้คือ **ภาพสถานะจริงที่ก้าวหน้ากว่านั้น**: มีฐานข้อมูลกลาง (SQL Server/Oracle) และ API ทำงานแล้ว ดังนั้น OpenMetadata ในเฟสถัดไปควรตั้ง **Connector ตรงกับฐานข้อมูลกลาง** เป็นหลัก และดึง **Lineage ต้นทาง → กลาง → API** อัตโนมัติ

---

## 🧱 ภาพรวมสถาปัตยกรรม (Current-State Architecture)

```mermaid
graph LR
    subgraph SRC["1 · ระบบต้นทาง (Source Systems)"]
        REG["REG-DB<br/>ทะเบียนนักศึกษา"]
        HR["HRIS<br/>บุคลากร"]
        CUR["ระบบหลักสูตร"]
        FIN["ระบบการเงิน/งบประมาณ"]
        EXT["บริการภายนอก<br/>(API ต้นทาง)"]
    end

    subgraph ING["2 · การนำเข้า (Ingestion)"]
        ETL["ETL/ELT Batch<br/>ตามรอบ"]
        APIIN["API Connector<br/>ดึงจากต้นทาง"]
        DBLINK["DB Direct / View<br/>(read-only)"]
    end

    subgraph CORE["3 · ฐานข้อมูลกลาง (SQL Server / Oracle)"]
        LAND["Landing / Staging<br/>ข้อมูลดิบ"]
        INTG["Integrated / Core<br/>รวม+ทำสะอาด"]
        MART["Serving / Mart<br/>พร้อมให้บริการ"]
    end

    subgraph SVC["4 · ชั้นบริการ API"]
        GW["API Gateway<br/>auth · rate-limit · log"]
        API["REST API Services<br/>JSON"]
    end

    subgraph APP["ระบบที่พัฒนาขึ้นเอง (Consumers)"]
        A1["เว็บแอป/พอร์ทัล"]
        A2["โมบายแอป"]
        A3["แดชบอร์ด BI (SVC-05)"]
    end

    REG & HR & CUR & FIN --> ETL
    REG & HR & CUR & FIN --> DBLINK
    EXT --> APIIN
    ETL & APIIN & DBLINK --> LAND
    LAND --> INTG --> MART
    MART --> API --> GW --> A1 & A2 & A3
```

> [!tip] หลักการออกแบบ (Design Principles)
> **แยกชั้นชัดเจน (Layered)** · **อ่านอย่างเดียวจากต้นทาง (Read-only at source)** · **ฐานกลางเป็นแหล่งอ้างอิงเดียว (Single Source of Truth)** · **บริการผ่าน API ไม่ให้ต่อ DB ตรง (API-first / no direct DB to consumers)** · **มีธรรมาภิบาลฝังในทุกชั้น (Governance by design)**

---

## 1️⃣ ชั้นแหล่งต้นทาง + วิธีนำเข้า (Ingestion Patterns)

ปัจจุบันทีมใช้ **3 รูปแบบผสมกัน** ตามความพร้อมและข้อจำกัดของแต่ละระบบต้นทาง:

| รูปแบบ | เหมาะกับ | ความถี่ | ข้อดี | ข้อควรระวัง / ธรรมาภิบาล |
|--------|----------|---------|-------|--------------------------|
| **ETL/ELT Batch** | ระบบฐานข้อมูลที่ดึงเป็นชุดได้ (REG-DB, HRIS, การเงิน) | รายวัน/รายชั่วโมงตามรอบ | ควบคุมรอบได้ ทำ transform/ทำสะอาดครบ | ต้องมี **watermark/incremental** กันดึงซ้ำทั้งก้อน · log ทุกรอบ |
| **API ของต้นทาง** | บริการภายนอก/ระบบที่เปิด API ให้ | ตามรอบ/ตามเหตุการณ์ | ไม่แตะ DB ต้นทางตรง ลดภาระระบบ | จัดการ **token/secret** ใน vault · retry + backoff · เพดาน rate ของต้นทาง |
| **ต่อ DB ตรง / View (read-only)** | ระบบที่อนุญาตเชื่อมตรง ใช้ข้อมูลสด | เรียลไทม์เมื่อ query | ได้ข้อมูลล่าสุดทันที ไม่ต้องคัดลอก | ใช้ **บัญชี read-only** + View จำกัดคอลัมน์ · เสี่ยงกระทบ performance ต้นทาง |

> [!warning] กฎเหล็กการเชื่อมต้นทาง
> - เชื่อมด้วย **บัญชีบริการสิทธิ์ read-only เท่านั้น** แยกบัญชีต่อระบบ (ไล่ที่มาได้)
> - ระบบต้นทางที่มีข้อมูลส่วนบุคคล ต้องผ่าน [[เครื่องมือ/T07 - แบบฟอร์มคำขอเข้าถึงข้อมูล (Data Access Request)\|T07 Data Access Request]] และอนุมัติโดย [[02 - โครงสร้างองค์กรและธรรมาภิบาล#👥 บทบาทหน้าที่หลัก (สอบทานกับ DAMA-DMBOK)\|Data Owner]] ก่อนต่อ
> - ทุก pipeline ต้องบันทึกใน [[เครื่องมือ/T01 - ทะเบียนบัญชีข้อมูล (Data Inventory Register)\|T01 Data Inventory]] และผูกกิจกรรมประมวลผลใน [[เครื่องมือ/T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)\|T03 RoPA]]

---

## 2️⃣ ฐานข้อมูลกลาง — โครงชั้น (SQL Server / Oracle)

ออกแบบเป็น **3 โซน** เพื่อแยกข้อมูลดิบออกจากข้อมูลพร้อมใช้ (ลดความเสี่ยงและทำ lineage ง่าย):

```mermaid
graph TD
    L["🟫 Landing / Staging<br/>ข้อมูลดิบจากต้นทาง 1:1<br/>เก็บชั่วคราว · ไม่เปิดให้ API"]
    I["🟦 Integrated / Core<br/>รวม-จับคู่-ทำสะอาด-กำหนดคีย์กลาง<br/>เป็น Single Source of Truth"]
    M["🟩 Serving / Mart<br/>ตาราง/วิวที่ออกแบบเพื่อ API/รายงาน<br/>ปิดบังฟิลด์อ่อนไหวตามสิทธิ์"]
    L --> I --> M
    M --> API["ชั้น API อ่านจากโซนนี้เท่านั้น"]
```

| โซน | บทบาท | ใครเข้าถึง | หมายเหตุธรรมาภิบาล |
|-----|-------|-----------|--------------------|
| **Landing/Staging** | สำเนาดิบจากต้นทาง ยังไม่ทำสะอาด | ทีม Data Engineer เท่านั้น | เก็บเท่าที่จำเป็น ตั้ง **retention** ลบ raw ตามรอบ |
| **Integrated/Core** | รวมหลายต้นทาง จับคู่ entity กำหนด surrogate key | ทีมในศูนย์ฯ + กระบวนการสร้าง mart | จุดบังคับ **คุณภาพข้อมูล** + จำแนกชั้น/PII |
| **Serving/Mart** | ออกแบบตามการใช้งานของ API/Dashboard | API service (ผ่าน account เฉพาะ) | **ไม่เก็บฟิลด์อ่อนไหวเกินจำเป็น** · มี view masking |

> [!example] แนวปฏิบัติเชิงเทคนิค
> - **คีย์กลาง (surrogate/golden key):** จับคู่บุคคล/นักศึกษา/หลักสูตรข้ามระบบด้วยคีย์กลาง แทนการใช้เลขบัตรประชาชนตรง ๆ ในชั้นบริการ
> - **Incremental load:** ใช้คอลัมน์ `updated_at`/CDC watermark กันดึงทั้งตาราง
> - **Audit columns:** ทุกตารางมี `source_system`, `loaded_at`, `batch_id` เพื่อ lineage และ debug
> - **Naming convention:** `stg_*`, `core_*`, `mart_*` แยกโซนชัดเจน

---

## 3️⃣ ชั้นบริการ API (REST + API Gateway)

```mermaid
graph LR
    APP["ระบบที่พัฒนาเอง"] -->|HTTPS + Token| GW["API Gateway"]
    GW -->|AuthN/AuthZ ผ่าน| SSO["SSO / OAuth2 / API Key"]
    GW -->|rate-limit · log · quota| API["REST API Services"]
    API -->|อ่านอย่างเดียว| MART["โซน Serving/Mart"]
    GW -.metrics.-> MON["Monitoring / Audit Log"]
```

### 🔐 การยืนยันตัวตนและสิทธิ์
| กลไก | รายละเอียด |
|------|------------|
| **AuthN** | OAuth2 / API Key ออกให้ต่อระบบผู้บริโภค (client) — ผูกกับ SSO มหาวิทยาลัยเมื่อพร้อม |
| **AuthZ** | Scope/role ต่อ endpoint — ระบบหนึ่งเห็นเฉพาะชุดข้อมูลที่ได้รับอนุมัติ (อ้างอิง [[เครื่องมือ/T07 - แบบฟอร์มคำขอเข้าถึงข้อมูล (Data Access Request)\|T07]]) |
| **Transport** | บังคับ **HTTPS/TLS** ทุกการเรียก |

### 📐 มาตรฐาน API (แนะนำให้เป็นข้อบังคับ)
- **Versioning:** ใส่เวอร์ชันใน path เช่น `/api/v1/...` เพื่อเปลี่ยน schema ได้โดยไม่พังผู้ใช้เดิม
- **Pagination & filtering:** บังคับ paginate ทุก endpoint ที่คืน list (กัน payload ใหญ่)
- **Rate limiting & quota:** ตั้งเพดานต่อ client ที่ Gateway
- **Standard error format:** โครง error เดียวกันทั้งระบบ (code/message/trace-id)
- **API Documentation:** ทำ **OpenAPI/Swagger** ต่อบริการ เป็นสัญญา (contract) กับผู้พัฒนา
- **Audit logging:** บันทึกทุกการเรียก (ใคร-เมื่อไหร่-ขอข้อมูลใด) ที่ Gateway → ใช้สอบย้อนและตรวจ PDPA

> [!warning] ข้อมูลส่วนบุคคลผ่าน API
> Endpoint ที่คืนข้อมูลส่วนบุคคล (`#standard/pdpa`) ต้อง: (1) มี **ฐานทางกฎหมาย**บันทึกใน [[เครื่องมือ/T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)\|RoPA]] · (2) คืน **เฉพาะฟิลด์ที่จำเป็น** (data minimization) · (3) ปิดบัง/แฮชฟิลด์อ่อนไหวเมื่อไม่จำเป็น · (4) ผ่าน [[04 - แคตตาล็อกงานและบริการ#📋 แคตตาล็อกบริการ (Service Catalog)\|SVC-02 DPIA]] หากเป็นชุดข้อมูลความเสี่ยงสูง

---

## 🛡️ การวางทับธรรมาภิบาล (Governance Overlay)

ทุกชั้นข้างต้นต้องเชื่อมกับกรอบของศูนย์ฯ ไม่ใช่แค่ "ท่อส่งข้อมูล":

| ประเด็นธรรมาภิบาล | จุดบังคับใช้ในสถาปัตยกรรม | เครื่องมือ/เอกสารอ้างอิง |
|--------------------|----------------------------|---------------------------|
| **บัญชีข้อมูล (Inventory)** | ทุก pipeline/ตาราง mart/endpoint ลงทะเบียน | [[เครื่องมือ/T01 - ทะเบียนบัญชีข้อมูล (Data Inventory Register)\|T01]] · [[08 - แผนการจัดทำ Data Inventory]] |
| **จำแนกชั้นความลับ** | ติด Tier ที่ตาราง core/mart และที่ endpoint | นโยบายใน [[03 - กลไกการกำกับติดตามและตัวชี้วัด#📜 นโยบายและมาตรฐานหลัก\|เอกสาร 03]] |
| **PDPA / PII** | จำแนก PII, minimization, masking, ฐานกฎหมาย | [[เครื่องมือ/T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)\|T03 RoPA]] · [[04 - แคตตาล็อกงานและบริการ#📋 แคตตาล็อกบริการ (Service Catalog)\|SVC-02 DPIA]] |
| **สิทธิ์เข้าถึง** | บัญชี read-only ต้นทาง + scope ของ client API | [[เครื่องมือ/T07 - แบบฟอร์มคำขอเข้าถึงข้อมูล (Data Access Request)\|T07]] |
| **Lineage** | ต้นทาง → landing → core → mart → endpoint | OpenMetadata ([[10 - แผนบูรณาการ OpenMetadata (Data Catalog)]]) |
| **คุณภาพข้อมูล** | กฎตรวจที่โซน core (completeness/validity) | [[เครื่องมือ/T09 - แดชบอร์ดติดตาม KPI (KPI Tracker)\|T09]] |
| **ความเสี่ยง** | pipeline/endpoint เสี่ยงสูงทำเครื่องหมาย | [[เครื่องมือ/T04 - ทะเบียนความเสี่ยงข้อมูล (Data Risk Register)\|T04]] |
| **เหตุข้อมูลรั่วไหล** | audit log ช่วยระบุขอบเขตผลกระทบ | [[เครื่องมือ/T08 - แบบบันทึกและตอบสนองเหตุข้อมูลรั่วไหล (Data Incident Report)\|T08]] |

---

## 👥 RACI — งานบูรณาการข้อมูลและ API

> R = Responsible, A = Accountable, C = Consulted, I = Informed

| กิจกรรม | CDO | Steward | Owner (ต้นทาง) | Custodian/IT | DPO |
|---------|:---:|:---:|:---:|:---:|:---:|
| อนุมัติเชื่อมระบบต้นทางใหม่ | A | C | A/R | R | C |
| พัฒนา/ดูแล pipeline (ETL/API/View) | A | C | I | R | I |
| ออกแบบโซนฐานข้อมูลกลาง | A | C | I | R | I |
| จำแนกชั้น/PII บนตาราง core-mart | A | R | C | C | C/R |
| ออกแบบ/เผยแพร่ REST API + contract | A | C | C | R | I |
| ออก API key/scope ให้ระบบผู้บริโภค | I | C | A | R | C |
| ตรวจ audit log & PDPA compliance | A | C | I | R | A/R |

> [!warning] แยกหน้าที่ (Segregation of Duties)
> ผู้**อนุมัติสิทธิ์**ให้ระบบผู้บริโภค (Data Owner) ต้องแยกจากผู้**ออก key เชิงเทคนิค** (Custodian/IT) — สอดคล้องหลักใน [[02 - โครงสร้างองค์กรและธรรมาภิบาล#📊 ตาราง RACI — กระบวนการสำคัญ\|RACI กลาง]]

---

## 📈 ตัวชี้วัดและ SLA (Pipeline & API)

| ตัวชี้วัด | นิยาม | เป้าหมายตัวอย่าง | ป้อนเข้า |
|----------|-------|------------------|----------|
| **Pipeline Success Rate** | % รอบ ingestion ที่สำเร็จ | ≥ 99% | [[เครื่องมือ/T09 - แดชบอร์ดติดตาม KPI (KPI Tracker)\|T09]] |
| **Data Freshness** | ระยะเวลาตั้งแต่ข้อมูลเกิดที่ต้นทางถึงพร้อมใน mart | ≤ รอบที่ตกลง (เช่น 24 ชม.) | KPI Dashboard |
| **API Availability** | uptime ของชั้นบริการ | ≥ 99.5% | Monitoring |
| **API Latency (p95)** | เวลาตอบสนองเปอร์เซ็นไทล์ที่ 95 | ≤ 500 ms | Gateway metrics |
| **Data Quality Score** | ผ่านกฎ completeness/validity ในโซน core | ≥ 90% | [[03 - กลไกการกำกับติดตามและตัวชี้วัด#📈 ชุดตัวชี้วัด (KPI Dashboard)\|KPI Dashboard]] |
| **PDPA Endpoint Coverage** | % endpoint ที่มีข้อมูลส่วนบุคคลและผูก RoPA ครบ | 100% | [[เครื่องมือ/T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)\|T03]] |

---

## ⚠️ ความเสี่ยงและการรับมือ

| ความเสี่ยง | ผลกระทบ | การรับมือ |
|-----------|---------|-----------|
| ต่อ DB ต้นทางตรงกระทบ performance | ระบบต้นทางช้า/ล่ม | ใช้ read-replica/View · จำกัดเวลา query · ย้ายไป batch เมื่อเป็นไปได้ |
| ข้อมูลส่วนบุคคลรั่วผ่าน API | ผิด PDPA · เสียความเชื่อมั่น | minimization · masking · scope ต่อ client · audit log · [[เครื่องมือ/T08 - แบบบันทึกและตอบสนองเหตุข้อมูลรั่วไหล (Data Incident Report)\|T08]] |
| Pipeline ล้มเงียบ (silent fail) | ข้อมูล stale ผู้ใช้ไม่รู้ | alert เมื่อรอบ fail/ช้า · ตรวจ freshness · dashboard สถานะ |
| Schema ต้นทางเปลี่ยนโดยไม่แจ้ง | pipeline พัง/ข้อมูลเพี้ยน | contract กับเจ้าของระบบ · schema validation ในชั้น landing |
| Secret/Token หลุด | เข้าถึงต้นทาง/API โดยมิชอบ | เก็บใน secret vault · หมุน key ตามรอบ · ไม่ฝังใน code |
| ผู้บริโภคต่อ DB ตรงข้าม API | ข้ามการควบคุม/ผูกติด schema | **บังคับผ่าน API เท่านั้น** · ปิด network ตรงสู่ DB กลาง |
| ความรู้กระจุกที่คนเดียว | bus factor | runbook + เอกสาร OpenAPI + อบรม (เชื่อม [[04 - แคตตาล็อกงานและบริการ#📋 แคตตาล็อกบริการ (Service Catalog)\|SVC-08]]) |

---

## 📍 สถานะปัจจุบันและช่องว่างที่ต้องปิด (Status & Gaps)

> [!note] วิธีใช้ตารางนี้
> ทำเครื่องหมายตาม**สภาพจริง**ของทีม — ช่องที่ยัง ⬜ คือ backlog ที่ควรดันต่อเพื่อยกระดับเป็น Trusted Data Platform

| ด้าน | สถานะ | สิ่งที่ทำแล้ว / ช่องว่าง |
|------|:----:|--------------------------|
| เชื่อมต้นทาง 3 รูปแบบ (ETL/API/View) | 🟢 | ทำงานแล้ว — ทบทวนให้ทุกการเชื่อมเป็น read-only |
| ฐานข้อมูลกลาง SQL Server/Oracle | 🟢 | มีแล้ว — ตรวจว่ามีการแยกโซน landing/core/mart ชัดเจนหรือยัง |
| REST API + Gateway | 🟢 | เปิดให้ระบบที่พัฒนาเองแล้ว |
| OpenAPI/Swagger contract ครบทุก endpoint | 🟡 | จัดทำให้ครบและเป็นมาตรฐานเดียว |
| จำแนกชั้น/PII บนตาราง mart + endpoint | ⬜ | เชื่อมกับ [[10 - แผนบูรณาการ OpenMetadata (Data Catalog)]] |
| ผูก RoPA ทุก endpoint ที่มีข้อมูลส่วนบุคคล | ⬜ | [[เครื่องมือ/T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)\|T03]] |
| Audit log การเรียก API ครบถ้วน | 🟡 | ตรวจว่า log พอสำหรับสอบย้อน PDPA |
| Monitoring/Alert freshness & failure | ⬜ | ตั้ง alert + dashboard สถานะ pipeline |
| Lineage อัตโนมัติ ต้นทาง→กลาง→API | ⬜ | ได้จาก OpenMetadata connector ฐานกลาง |

> [!example] ขั้นต่อไปที่แนะนำ (Next Steps)
> 1. ตั้ง **OpenMetadata connector** ตรงกับ SQL Server/Oracle ฐานกลาง → ได้ catalog + lineage อัตโนมัติ ([[10 - แผนบูรณาการ OpenMetadata (Data Catalog)#🔵 G1 — เชื่อมต่อและดึง metadata (จับคู่ P1 Discovery)\|ดู G1]])
> 2. จำแนก **PII/Tier** บนตาราง mart และระบุที่ endpoint → ปิดช่อง PDPA
> 3. ทำ **OpenAPI contract + audit log** ให้ครบทุกบริการ
> 4. ตั้ง **alert freshness/failure** ของ pipeline เข้าสู่ KPI Dashboard

---

## ✅ เช็กลิสต์ส่งมอบ (Definition of Done)

- [ ] ทุกการเชื่อมต้นทางใช้บัญชี read-only แยกต่อระบบ และลงทะเบียนใน [[เครื่องมือ/T01 - ทะเบียนบัญชีข้อมูล (Data Inventory Register)\|T01]]
- [ ] ฐานกลางแยกโซน landing/core/mart พร้อม audit columns (`source_system`, `loaded_at`, `batch_id`)
- [ ] ทุก REST API มี versioning, pagination, error format มาตรฐาน และเอกสาร OpenAPI
- [ ] API Gateway บังคับ HTTPS + auth + rate-limit + audit log
- [ ] ตาราง mart/endpoint ที่มีข้อมูลส่วนบุคคล จำแนก PII + ผูก [[เครื่องมือ/T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)\|RoPA]] ครบ
- [ ] มี monitoring/alert สำหรับ pipeline failure และ data freshness
- [ ] เชื่อม metric เข้า [[03 - กลไกการกำกับติดตามและตัวชี้วัด#📈 ชุดตัวชี้วัด (KPI Dashboard)\|KPI Dashboard]] / [[เครื่องมือ/T09 - แดชบอร์ดติดตาม KPI (KPI Tracker)\|T09]]
- [ ] runbook การ deploy/แก้ปัญหา pipeline และ API จัดทำแล้ว
