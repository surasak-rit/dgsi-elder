---
marp: true
title: โครงสร้างทีมและ Operating Model (ERP & Transformation)
paginate: true
theme: default
style: |
  section {
    font-family: 'Loma', 'Noto Color Emoji', sans-serif;
    font-size: 26px;
    padding: 50px 60px;
  }
  h1 { color: #1d4ed8; font-size: 44px; }
  h2 { color: #1e293b; border-bottom: 3px solid #4f46e5; padding-bottom: 8px; }
  strong { color: #1d4ed8; }
  table { font-size: 20px; }
  th { background: #4f46e5; color: #fff; }
  section.lead { text-align: center; }
  section.lead h1 { font-size: 52px; }
  .green { color: #15803d; font-weight: 700; }
  .blue { color: #1d4ed8; font-weight: 700; }
  .warn { color: #dc2626; font-weight: 700; }
---

<!-- _class: lead -->

# โครงสร้างทีม & Operating Model

## ทีม 9 คน · ERP · Transformation · งานพันธกิจหลัก

เอกสารสื่อสารภายในทีม — 2026

---

## ❓ โจทย์ที่เราเจอ

- ทีมมีเพียง **9 คน** แต่ต้องทำ **3 ภารกิจพร้อมกัน**
  - 🔵 วางรากฐานระบบ **ERP** (โครงการพิเศษ เร่งด่วน)
  - 🔵 **Transform** กระบวนการ — พัฒนาระบบใหม่หลายระบบ
  - 🟢 **งานพันธกิจหลัก (BAU)** ของศูนย์
- ⚠️ ปัจจุบัน: ทีมถูกดึงไปทำโครงการ **จนไม่มีเวลาทำงานหลัก**
- ⏰ มี **deadline ชัดเจน** กดดันด้านเวลา

---

## 🔑 ทางออก: คันโยก 2 ตัว

| คันโยก | ความหมาย |
|--------|----------|
| **ERP เป็น off-the-shelf** | ทีมในไม่ต้อง build เอง → เปลี่ยนเป็น **"ผู้คุม"** |
| **มีงบจ้างภายนอก** | ใช้ **vendor/SI** รับภาระงาน build หนัก |

➡️ ทีม 9 คนทำหน้าที่ **requirement · integration · UAT · sign-off** แทนการลงมือ build ทุกอย่างเอง

---

## 🎯 หลักคิด 4 ข้อ

1. **แยก "Run" ออกจาก "Change"** — กันคนปกป้องงานหลัก
2. **ทีมในเป็นผู้คุม ไม่ใช่ผู้ลงมือทั้งหมด** — vendor build, เรา sign-off
3. **มีเจ้าของชัดเจน** — ทุกงานมีผู้รับผิดชอบสุดท้าย (A) คนเดียว
4. **ลด Single Point of Failure** — โดยเฉพาะ DBA & Reporter

---

## 🗂️ ผังโครงสร้างทีม

![w:1000](assets/org-chart-delivery-team.png)

---

## 👥 ใครอยู่ตรงไหน

| บทบาท | คน | สังกัด |
|-------|-----|--------|
| Tech Lead / Architect | Senior #1 | ข้ามทีม |
| ERP Module Owner | Senior #2 | 🔵 Change |
| New Systems Owner | Senior #3 | 🔵 Change |
| Integration Lead | Mid-Snr #1 | 🔵 Change |
| Build Lead | Mid-Snr #2 | 🔵 Change |
| Build / Config support | Mid Dev #2 | 🔵 Change |
| Run Developer | Mid Dev #1 | 🟢 Run |
| DBA & Reporter ⚠ | DBA #1 | 🟢/🔵 แชร์ |
| PMO / Vendor & Procurement | จนท.บริหารฯ | Enablement |

---

## 📊 RACI (ย่อ) — ใครรับผิดชอบอะไร

| ระบบ / งาน | เจ้าของ (A) | ลงมือ (R) |
|-----------|-------------|-----------|
| พันธกิจหลัก / BAU | Run Dev | Run Dev |
| ERP — implement | ERP Owner | **Vendor** |
| ระบบใหม่ (build เอง) | New Sys Owner | Build Lead |
| Integration | Tech Lead | Integration Lead |
| Data / Reporting | DBA & Reporter | DBA & Reporter |
| Vendor & จัดซื้อจ้าง | PMO | PMO |

<span class="warn">ERP: Vendor ลงมือ (R) · ERP Owner รับผิดชอบ (A) → กัน lock-in</span>

---

## 🔄 วิธีทำงาน

- <span class="green">Run Team</span> — **ล็อกเวลา ~40–50%** กับ BAU **ห้ามดึงไปโครงการ**
- <span class="blue">Change Team</span> — **Scrum** sprint 2 สัปดาห์ มี demo
- งาน support — **Kanban + SLA**
- **Vendor-led:** vendor build → เรา UAT → integration → sign-off
- ประชุม: Daily standup · Weekly sync · Biweekly steering

---

## ⚠️ ความเสี่ยง & การรับมือ

| ความเสี่ยง | วิธีลด |
|-----------|--------|
| DBA คนเดียว (SPOF) | **KT** + vendor สำรอง + runbook |
| Deadline เร่ง + คนน้อย | ตัด scope เป็น phase, vendor รับงานหนัก |
| BAU ถูกละเลยซ้ำ | **ล็อก Run Team** + governance |
| พึ่ง vendor เกินไป | ทีมในถือ architecture + บังคับ KT |

---

## 🚀 Quick Wins — 3 เดือนแรก

- **เดือน 1:** ล็อก Run Team + จ้าง vendor งานเร่งด่วน → ปลดภาระทันที
- **เดือน 1–2:** กำหนด **MVP scope** ERP + เริ่ม **KT งาน DBA**
- **เดือน 2–3:** ตั้ง PMO เบา ๆ + dashboard ติดตาม deadline

---

<!-- _class: lead -->

# ขับเคลื่อนพร้อมกัน

## ปกป้องงานหลัก 🟢 · เร่งโครงการ 🔵 · ใช้ vendor ให้คุ้ม 🟠

_รายละเอียดเต็ม: เอกสาร "12 - โครงสร้างทีมและ Operating Model"_
