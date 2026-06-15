---
title: แดชบอร์ดติดตาม KPI (KPI Tracker)
tags:
  - dgsi/toolkit
  - tool/register
  - governance/kpi
aliases:
  - KPI Tracker
  - แดชบอร์ดติดตาม KPI
created: 2026-06-15
status: template
---

# 📈 แดชบอร์ดติดตามตัวชี้วัด (KPI Tracker)

> เครื่องมือ T09 ในชุด [[09 - เครื่องมือดำเนินงาน (Operations Toolkit)]] — บันทึกค่าจริงของ [[03 - กลไกการกำกับติดตามและตัวชี้วัด#📈 ชุดตัวชี้วัด (KPI Dashboard)|KPI Dashboard]] เพื่อรายงานต่อ Council รายไตรมาส

> [!info] วิธีใช้
> บันทึกค่าจริงตามรอบความถี่ของแต่ละ KPI เทียบกับเป้าหมาย ใส่สถานะไฟ (🟢 ถึงเป้า · 🟡 ใกล้เป้า · 🔴 ต่ำกว่าเป้า) และระบุการดำเนินการแก้ไขถ้าต่ำกว่าเป้า

---

## 📊 ตารางบันทึกค่า KPI

| KPI | เป้าหมาย | ความถี่ | ผู้รับผิดชอบ | ค่าล่าสุด | สถานะ | งวด | แนวโน้ม | การดำเนินการ |
|-----|---------|---------|--------------|-----------|:-----:|-----|:-------:|----------------|
| Data Quality Score | ≥ 90% | รายเดือน | `#role/steward` | ___% | 🟡 | 2026-Q3 | → | _________ |
| Metadata Coverage | ≥ 80% ใน 18 เดือน | รายไตรมาส | `#role/cdo` | ___% | 🔴 | 2026-Q3 | ↑ | เร่ง P2 ใน [[08 - แผนการจัดทำ Data Inventory\|Data Inventory]] |
| PDPA Compliance Rate | 100% ระบบเสี่ยงสูง | รายไตรมาส | `#role/dpo` | ___% | 🟡 | 2026-Q3 | ↑ | เร่ง [[T02 - แบบประเมินผลกระทบความเป็นส่วนตัว (DPIA)\|DPIA]] ค้าง |
| Data Incident Count | ลด YoY, 0 ร้ายแรง | รายเดือน | `#role/custodian` | ___ | 🟢 | 2026-Q3 | → | — |
| Data Literacy Coverage | ≥ 60% ใน 2 ปี | รายไตรมาส | `#role/cdo` | ___% | 🟡 | 2026-Q3 | ↑ | _________ |
| Self-service Analytics Adoption | +20% ต่อปี | รายไตรมาส | Analytics & AI | ___ | 🟡 | 2026-Q3 | ↑ | _________ |
| AI Ethics Review Rate | 100% | รายโครงการ | `#role/council` | ___% | 🟢 | 2026-Q3 | → | ใช้ [[T06 - แบบกลั่นกรองจริยธรรม AI (AI Ethics Review)\|T06]] ทุกโครงการ |

---

## 🗃️ ตัวชี้วัดงาน Data Inventory (North Star)

| ตัวชี้วัด | เป้าหมาย | ค่าล่าสุด | สถานะ |
|-----------|---------|-----------|:-----:|
| Inventory Coverage | ≥ 95% | ___% | 🔴 |
| Ownership Assigned | 100% | ___% | 🟡 |
| PDPA Mapping | 100% | ___% | 🟡 |
| Inventory Freshness (≤ 90 วัน) | ≥ 90% | ___% | 🟡 |

> ที่มาข้อมูล: [[T01 - ทะเบียนบัญชีข้อมูล (Data Inventory Register)|Data Inventory Register]] · [[T03 - ทะเบียนกิจกรรมการประมวลผลข้อมูล (RoPA)|RoPA]]

---

## 📝 สรุปเสนอ Council รายไตรมาส

- **ไฮไลต์ (เขียว):** _____________
- **ประเด็นเสี่ยง (แดง/เหลือง):** _____________ → ดู [[T04 - ทะเบียนความเสี่ยงข้อมูล (Data Risk Register)|Data Risk Register]]
- **ข้อเสนอเพื่อพิจารณา:** _____________ → บันทึกมติใน [[T10 - วาระและบันทึกมติการประชุม Council (Council Agenda & Decision Log)|Council Decision Log]]

> [!tip] ทำเป็นกราฟอัตโนมัติ
> หากใช้ Obsidian + ปลั๊กอิน Dataview/Charts สามารถดึงค่าจากตารางนี้มาทำกราฟแนวโน้มได้ หรือต่อยอดสู่ Data Governance Dashboard กลางตามที่ระบุใน [[03 - กลไกการกำกับติดตามและตัวชี้วัด]]
</content>
