# 03 — แนวปฏิบัติสากลสำหรับคำถามที่ยังค้าง (International Standards Reference)
> นำคำถามที่เอกสาร Requirements "ตอบไม่ได้" (14 ข้อ) + "ต้องยืนยัน" (5 ข้อ) ในไฟล์ `02` มาเทียบกับ **มาตรฐานสากล** ว่าเขาทำกันอย่างไร พร้อมข้อเสนอสำหรับ AMC
> ใช้เป็นฐานอ้างอิงตอนสัมภาษณ์ผู้ใช้ — เพื่อ "เสนอ default ที่ถูกหลักสากล" แทนการถามลอยๆ

## มาตรฐานหลักที่อ้างถึง
| ย่อ | ชื่อเต็ม | ผู้จัดทำ / ปี | ใช้ตอบหมวด |
|-----|---------|----------------|------------|
| **GIPS 2020** | Global Investment Performance Standards (Standards for Firms) | CFA Institute, 2019 (มีผล 2020) | C, H (ตัวชี้วัด/แก้ไขข้อมูล) |
| **DAMA-DMBOK2** | Data Management Body of Knowledge, 2nd ed. | DAMA International, 2017 | F, H, I (data pipeline/quality/catalog) |
| **ISO/IEC 27001:2022** | Information Security Management — Annex A controls | ISO/IEC, 2022 | B, I (access control/logging/classification) |
| **NIST SP 800-53 / 800-92** | Security & Privacy Controls / Log Management | NIST | B, I |
| **GDPR / PDPA** | EU 2016/679 / พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 | EU / ไทย | I (retention/privacy) |
| **IBCS / ISO 24896:2026** | International Business Communication Standards | IBCS Assoc. / ISO | A, E, G (การออกแบบรายงาน) |
| **Shneiderman 1996** | Visual Information-Seeking Mantra | B. Shneiderman | A, G (overview→detail) |
| **MS Power BI / Tableau / NN/g / Stephen Few** | แนวปฏิบัติ BI/Dashboard ทางการ | Microsoft / Salesforce / NN/g | A, E, G |

---

# ส่วนที่ 1 — 14 ข้อที่เอกสารตอบไม่ได้

## 🟦 หมวด A — ความต้องการผู้ใช้และการออกแบบ

### A2/A3 — ผู้ใช้อยากรู้อะไรอันดับแรก + ใช้รายงานทำอะไร
**สากลทำกันยังไง**
- **Microsoft Power BI — BI solution planning**: ขั้นแรกคือ "business design sessions" ประชุมเชิงปฏิบัติการกับ *ผู้ใช้จริง* ไม่ใช่แค่ผู้บริหารสั่งลงมา — "การเก็บ requirement ผิดคนคือสาเหตุหลักที่โครงการ BI ล้มเหลว" แล้วทำ **mock-up/wireframe** ให้ stakeholder เซ็นรับก่อนสร้างจริง
- **Stephen Few**: บททดสอบสำคัญคือ *"Are they doing the job?"* — ออกแบบเพื่อ "งาน" ของผู้ใช้ ไม่ใช่ความสวย; เวลา test อย่าถาม "ชอบหน้าตาไหม" แต่ถาม "สิ่งที่ต้องสนใจเด่นพอไหม / มองเห็น trend ทันทีไหม"
- **NN/g**: แยกประเภท dashboard ก่อน — *operational* (ตัดสินใจเร็ว real-time) vs *analytical* (วิเคราะห์ย้อนหลัง) → ชนิดเป็นตัวกำหนดดีไซน์
- **Tableau**: เริ่มที่ "Know your purpose and audience — what are you trying to say?"

**ข้อเสนอสำหรับ AMC**
- รายงานนี้เป็น **analytical dashboard** (ติดตามผลย้อนหลัง ไม่ใช่ real-time) → default คือ "ภาพรวมผลตอบแทน vs benchmark ของกองที่ฉันดูแล ณ ข้อมูลล่าสุด"
- จัดประชุม design session 1 ครั้งกับตัวแทนเจ้าของเงิน 3–4 ส่วนงาน + ทำ mock-up 5 หน้าให้เซ็นรับ
- 📌 *อ้างอิง:* [MS BI solution planning](https://learn.microsoft.com/en-us/power-bi/guidance/powerbi-implementation-planning-bi-strategy-bi-solution-planning), [Stephen Few — Dashboard Design](https://www.perceptualedge.com/files/Dashboard_Design_Course.pdf), [NN/g Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/)

### A4 — อุปกรณ์หลัก + ต้องพิมพ์ PDF ไหม
**สากลทำกันยังไง**
- **Power BI mobile best practice**: ออกแบบ desktop + mobile พร้อมกัน, มือถือเรียงบนลงล่าง, เอาเฉพาะ visual สำคัญ, slicer เรียงแนวนอน, ความกว้าง canvas ≤ 323pt
- **PDF/print**: ออกแบบให้ "หน้ายืนได้ด้วยตัวเอง" — มีหัวข้อ/legend/หมายเหตุ เพราะ interactivity หายไป; ใช้ A4/Letter แนวนอน หรือใช้ **Paginated Report** สำหรับ pixel-perfect

**ข้อเสนอสำหรับ AMC**
- รองรับ desktop เป็นหลัก (รายงานราชการ) + ปุ่ม Export PDF แบบหน้ายืนได้เอง (มีโลโก้ ม.มหิดล + "ณ วันที่")
- 📌 *อ้างอิง:* [MS mobile-optimized reports](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-create-mobile-optimized-report-best-practices), [MS export to PDF](https://learn.microsoft.com/en-us/power-bi/collaborate-share/end-user-pdf)

---

## 🟦 หมวด B/I — ความปลอดภัยและสิทธิ์

### B5 — role admin + การทบทวนสิทธิ์
**สากลทำกันยังไง**
- **ISO 27001:2022**: `A.5.15` (นโยบาย access control), `A.5.18` (ให้/แก้/**ทบทวน**/เพิกถอนสิทธิ์), `A.8.3` (จำกัดการเข้าถึงระดับ granular — เข้าถึงหลัง authenticate, แยก read/write), `A.8.2` (privileged access — admin ต้องจำกัดและ log แยก)
- **NIST SP 800-53**: `AC-6` Least Privilege (ให้สิทธิ์เท่าที่จำเป็น), `AC-6(7)` **ทบทวนสิทธิ์ของแต่ละ role เป็นระยะ**, `AC-2/AC-3` จัดการ/บังคับ account; admin ใช้ AC-6(2)(5)(9)
- **PDPA ม.37(1)** + ประกาศมาตรการความมั่นคงปลอดภัย (มีผล 20 มิ.ย. 2565): บังคับให้มี access control + authentication + authorization → **เป็นหน้าที่ตามกฎหมายไทย**

**ข้อเสนอสำหรับ AMC**
- ใช้ **RBAC**: email → role → รายการกองที่เห็น (ตรงกับสเปกอยู่แล้ว); เพิ่ม role `admin` (เห็นทุกกอง, log แยก) และ **ทบทวนสิทธิ์ทุก 6–12 เดือน**
- 📌 *อ้างอิง:* [ISO A.5.15](https://www.isms.online/iso-27001/annex-a-2022/5-15-access-control-2022/), [ISO A.8.3](https://www.isms.online/iso-27001/annex-a-2022/8-3-information-access-restriction-2022/), [NIST AC-6](https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-6/)

### I2 — audit log การเข้าดู/ดาวน์โหลด (PDPA)
**สากลทำกันยังไง**
- **ISO 27001:2022 `A.8.15` Logging**: ต้องบันทึก **User ID + เหตุการณ์ + วันเวลา + อุปกรณ์/IP** สำหรับการเข้าถึง/ดาวน์โหลด/ลบไฟล์ และ **ผู้ใช้แก้/ลบ log ตัวเองไม่ได้** (append-only); `A.8.16` Monitoring เทียบกับ baseline
- **NIST SP 800-92**: ต้องนิยาม "บันทึกอะไร เก็บที่ไหน นานเท่าไร"; `AU-2/3/6/9/11` (เหตุการณ์/เนื้อหา who-what-when-where/ทบทวน/ปกป้อง/เก็บรักษา)
- **PDPA ม.37(4)**: แจ้งเหตุละเมิดภายใน **72 ชม.** → ต้องพึ่ง audit log เป็นหลักฐาน

**ข้อเสนอสำหรับ AMC**
- เก็บ log: ใคร(email) ดู/ดาวน์โหลดกองไหน เมื่อไร จาก IP ใด → เก็บแบบ append-only
- 📌 *อ้างอิง:* [ISO A.8.15](https://www.isms.online/iso-27001/annex-a-2022/8-15-logging-2022/), [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final)

### I3 — นโยบาย retention / การทำลายข้อมูล
**สากลทำกันยังไง**
- **GDPR Art. 5(1)(e) Storage Limitation**: เก็บข้อมูลส่วนบุคคล "ไม่นานเกินจำเป็นต่อวัตถุประสงค์"; Art.5(2) ต้อง **พิสูจน์ได้** (accountability)
- **PDPA**: ม.37(3) ต้องมีระบบลบ/ทำลายเมื่อพ้นกำหนด; ม.33 ลบตามคำขอภายใน **90 วัน**; ม.23/39 ระบุระยะเวลาเก็บล่วงหน้าใน ROPA
- **ISO 15489-1** records management: กำหนด **retention schedule** ที่มีเหตุผลรองรับ
- ⚠️ log (I2) กับข้อมูลหลัก (I3) มัก **เก็บคนละระยะ** — log มักเก็บนานกว่าเพื่อ accountability

**ข้อเสนอสำหรับ AMC**
- ทำ retention schedule แยก: ข้อมูลการลงทุน (เก็บยาว — มี 10Y/since inception) · ข้อมูล login/ส่วนบุคคล · audit log
- 📌 *อ้างอิง:* [GDPR Art.5](https://gdpr-info.eu/art-5-gdpr/), [ICO Storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/), PDPA ม.33/37

### I4 — เชื่อม Data Catalog (OpenMetadata) + lineage
**สากลทำกันยังไง**
- **DAMA-DMBOK2 Ch.12 Metadata Management**: data catalog เป็นกลไก discoverability/impact analysis/governance; metadata 3 ชนิด = business / technical / **operational (รวม data lineage)**
- **lineage** สำคัญต่อ BI เพราะให้ (1) **ความเชื่อถือ** — ผู้ใช้เห็นที่มาของตัวเลข, (2) **impact analysis** — แหล่งเปลี่ยน รู้ทันทีว่ารายงานไหนกระทบ, (3) **auditability**, (4) **debug** ตัวเลขผิดย้อนถึงต้นทาง

**ข้อเสนอสำหรับ AMC**
- ลงทะเบียนไฟล์ KBank (Raw/Unit Movement/Benchmark) + ตาราง Fact/Dim ใน **OpenMetadata** (มีแผนในเอกสาร 10 ของศูนย์ฯ อยู่แล้ว) ทำ lineage จากอีเมล → staging → fact → 5 หน้ารายงาน
- 📌 *อ้างอิง:* [DAMA-DMBOK Metadata](https://www.dama-mn.org/Data-Metadata), [Snowflake DAMA-DMBOK](https://www.snowflake.com/en/data-governance/frameworks/dama-dmbok/)

---

## 🟦 หมวด C/H — ตัวชี้วัดและคุณภาพข้อมูล

### C9 — ตัวชี้วัดเพิ่ม (Sharpe / Tracking Error / Drawdown ฯลฯ)
**สากลทำกันยังไง (GIPS 2020)**
- ตัวชี้วัด **ที่ "บังคับ" มีตัวเดียว**: **ex post standard deviation 3 ปี (annualized, ใช้ผลตอบแทนรายเดือน)** ของ *ทั้งกองและ benchmark* เมื่อมีข้อมูลครบ 36 เดือน (Provision `4.C.36`) → **ตรงกับ "ความผันผวน" ที่สเปกมีอยู่แล้ว**
- ตัวชี้วัดอื่น (**Sharpe, tracking error, information ratio, Sortino, max drawdown, alpha/beta**) GIPS จัดเป็น *"additional risk measures"* = **"แนะนำ" ไม่บังคับ** (Provision `4.B.5`) เลือกตามกลยุทธ์กอง; ถ้าแสดงต้องอธิบายวิธีคำนวณ + ระบุ risk-free rate (`4.C.43`) และ periodicity ต้องเท่ากัน (`2.A.18`)
- ⚠️ **กฎห้ามสำคัญ** (`2.A.12`): **ผลตอบแทนช่วงต่ำกว่า 1 ปี ห้าม annualize** — 1M/3M/6M ต้องแสดงตามจริง (สเปก AMC ทำถูกแล้ว); annualize เฉพาะ >12 เดือน

**ข้อเสนอสำหรับ AMC**
- Phase 1: คงตามสเปก (return, BM, ความผันผวน = ครบตามที่ GIPS บังคับ)
- Phase 2 (แนะนำ): เพิ่ม **Sharpe ratio + Tracking Error + Information Ratio** (เหมาะกับกองที่เทียบ BM) และ **Max Drawdown** (สื่อสารความเสี่ยงให้เจ้าของเงินเข้าใจง่าย)
- 📌 *อ้างอิง:* [GIPS Standards for Firms 2020 (PDF)](https://www.gipsstandards.org/wp-content/uploads/2021/03/2020_gips_standards_firms.pdf), [CFA Risk-Adjusted Measures](https://rpc.cfainstitute.org/sites/default/files/-/media/documents/code/gips/case-study-risk-adjusted-performance-measures.pdf)

### H3 — maker-checker / อนุมัติก่อนเผยแพร่
**สากลทำกันยังไง**
- **GIPS** ไม่ใช้คำว่า maker-checker แต่ **GIPS Sample Error Correction Policy** กำหนดให้มี **GIPS Compliance Oversight Committee** ทบทวนทุก error, มี **Error Incident Report** (ผู้ทำ = maker) ส่งให้กรรมการ, การแจกจ่ายฉบับแก้คุมโดย Compliance (checker) — คือ **segregation of duties** นั่นเอง
- **DAMA-DMBOK Ch.13**: คุณภาพข้อมูลต้องคุมด้วย control + reconciliation อัตโนมัติ ไม่ใช่ตรวจครั้งเดียว

**ข้อเสนอสำหรับ AMC**
- ใส่ขั้น **maker-checker**: ทีมข้อมูลนำเข้า/คำนวณ (maker) → หัวหน้า/ฝ่ายตรวจสอบยืนยัน (checker) ก่อน publish ขึ้นเว็บ ทุกรอบข้อมูล
- 📌 *อ้างอิง:* [GIPS Sample Error Correction Policy](https://www.gipsstandards.org/wp-content/uploads/2025/04/sample_error_correction_policy_firms-1.pdf)

### H4 — version / การแก้ไขข้อมูลย้อนหลัง (restatement)
**สากลทำกันยังไง**
- **GIPS** `4.C.38`: ต้อง **เปิดเผยการแก้ไข material error** ในรายงาน และคงคำชี้แจงไว้ **อย่างน้อย 1 ปี**; มี **4 ระดับความรุนแรง** (Level 1 ไม่ทำอะไร → Level 4 material: แก้+เปิดเผย+ส่งฉบับแก้ให้ผู้รับเดิม)
- **DAMA-DMBOK Ch.11 (Kimball)**: ใช้ **Slowly Changing Dimension Type 2** (เก็บประวัติด้วย effective/expiry date) + **snapshot** สำหรับ "as-of reporting" + **bitemporal** (valid time vs system time) เพื่อแสดงทั้งเลขเดิมและเลขที่แก้ และทำซ้ำได้

**ข้อเสนอสำหรับ AMC**
- เก็บข้อมูลแบบ **snapshot รายวันที่ + SCD2** บน DimFund → ทำรายงาน "ณ วันที่" ซ้ำได้ตรงเดิม; มีนโยบายระดับความรุนแรงของ error แบบ GIPS
- 📌 *อ้างอิง:* GIPS `4.C.38`; [DAMA/Kimball SCD & bitemporal](https://docs.databricks.com/aws/en/data-engineering/what-is-cdc)

---

## 🟦 หมวด E/G — การโต้ตอบและการแสดงผล

### E5 — filter วันที่ + ดาวน์โหลดตาราง
**สากลทำกันยังไง**
- **Tableau**: filter ปรับเป็น dropdown/checkbox, ใส่ชื่อ filter ให้ชัด, ระวังจำนวน filter มากทำให้ช้า; สร้าง default layout ให้ครบก่อน
- **progressive disclosure** (NN/g): เริ่มสรุป → drill ลงรายละเอียด

**ข้อเสนอสำหรับ AMC**: เพิ่ม date-range + drill-down ในหน้า 4/5, default = วันล่าสุด (ตรงสเปก)
- 📌 *อ้างอิง:* [Tableau Best Practices](https://help.tableau.com/current/pro/desktop/en-us/dashboards_best_practices.htm)

### G3 — รูปแบบ export + หัวรายงานราชการ
**สากลทำกันยังไง**
- **Microsoft**: ให้ **Excel/CSV** เมื่อผู้ใช้ต้องการข้อมูลดิบไปวิเคราะห์ต่อ/ตรวจสอบ; ให้ **PDF/image** สำหรับแจกจ่าย/เก็บถาวร; ทุกหน้าควรมี **โลโก้/หัวรายงาน + "as of" date + footnote แหล่งข้อมูล**; งานทางการ pixel-perfect ใช้ **Paginated Report**

**ข้อเสนอสำหรับ AMC**: Export PDF (มีตรามหาวิทยาลัย + ณ วันที่ + ที่มา KBank) สำหรับเสนอผู้บริหาร + Export Excel สำหรับทีมการเงินตรวจยอด
- 📌 *อ้างอิง:* [MS Export data](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-export-data), [MS Paginated Reports](https://learn.microsoft.com/en-us/power-bi/paginated-reports/report-builder/export-reports-report-builder)

### G5 — หน้า dashboard ภาพรวมทุกกอง
**สากลทำกันยังไง**
- **Shneiderman 1996 — Visual Information-Seeking Mantra**: *"Overview first, zoom and filter, then details-on-demand"* → ควรมี **หน้าสรุปภาพรวม + หน้ารายละเอียด** พร้อม drill path
- **IBCS / ISO 24896:2026**: ใช้ **notation มาตรฐานเดียวกันทุกหน้า** (สี/สัญลักษณ์ความหมายเดียวกัน) เพื่อ **เปรียบเทียบได้** (SUCCESS formula)

**ข้อเสนอสำหรับ AMC**: เพิ่ม **หน้า 0 — Overview** (สรุปทุกกองที่ผู้ใช้มีสิทธิ์: NAV รวม, return เด่น, alert กองที่ต่ำกว่า BM) เป็นประตูสู่ 5 หน้าเดิม; วาง notation ตาม IBCS
- 📌 *อ้างอิง:* [Shneiderman 1996 (PDF)](https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf), [IBCS Standards](https://www.ibcs.com/standards)

---

# ส่วนที่ 2 — 5 ข้อที่ "ต้องยืนยัน" (มีร่องรอยแล้ว)

| # | ประเด็น | แนวสากล | ข้อเสนอ |
|---|---------|---------|---------|
| **F1** | ความถี่ snapshot holdings | DAMA: เลือก latency ตามความต้องการธุรกิจ | ยืนยันกับ KBank: รายเดือน (month-end) ตามตัวอย่าง 31/7/2025 |
| **F4** | นำเข้า manual vs automated | **DAMA Ch.8 DII**: เลิก manual/point-to-point → ทำ pipeline อัตโนมัติ มี metadata + reconciliation + logging | สร้าง pipeline อ่านอีเมล/ไฟล์ KBank อัตโนมัติ (เลิกเปิดไฟล์มือ) |
| **F6** | ปีจัดตั้งแต่ละกอง | GIPS: ต้องมี since inception + สร้างจาก 5→10 ปี | ขอวันจัดตั้งรายกองมาเติม DimFund |
| **H1** | แหล่งความจริงตัวเลข | GIPS: fair representation; DAMA: single source of truth | กำหนด KBank เป็น source of truth + ระบบ reconcile ไม่คำนวณซ้ำให้ขัดกัน |
| **H2/H5** | %NAV=100%, normalize Client Code | **DAMA Ch.10 MDM**: golden record + key normalization (deterministic matching) | ทำ Client/Fund master + กฎตัด prefix `M`; ตรวจ Σ%NAV=100% เป็น DQ rule |

---

# สรุปสำหรับผู้บริหาร (Executive Takeaways)
1. **สเปกปัจจุบันสอดคล้อง GIPS ในแกนหลักแล้ว** — return ใช้ NAV/unit, ไม่ annualize ช่วง <1 ปี, มีความผันผวน (= metric เดียวที่ GIPS บังคับ) ✅
2. **ควรเพิ่ม phase 2**: Sharpe / Tracking Error / Max Drawdown (GIPS แนะนำ), หน้า Overview (Shneiderman/IBCS), Export PDF ทางการ
3. **3 เรื่อง "ต้องมี" ตามกฎหมายไทย (PDPA) + ISO 27001**: RBAC ทบทวนสิทธิ์, audit log การเข้าดู/ดาวน์โหลด, retention schedule + การลบข้อมูล
4. **สถาปัตยกรรมข้อมูล**: เปลี่ยนจากไฟล์อีเมล manual → pipeline อัตโนมัติ + เก็บ snapshot/SCD2 (ทำรายงานย้อนหลังซ้ำได้) + ลง OpenMetadata ทำ lineage (ตาม DAMA)
5. **maker-checker** ก่อน publish ทุกรอบ (ตาม GIPS Error Correction)

---
*จัดทำโดยทีมข้อมูล DGSI — ทุกข้อเสนอมีมาตรฐานสากลรองรับ ใช้ประกอบการสัมภาษณ์ผู้ใช้และนำเสนอผู้บริหาร*
*หมายเหตุลิขสิทธิ์: ข้อความ GIPS/ISO ที่ยกมาเป็นข้อความสั้นเพื่ออ้างอิงเชิงออกแบบ © CFA Institute / ISO ตามต้นฉบับ*
