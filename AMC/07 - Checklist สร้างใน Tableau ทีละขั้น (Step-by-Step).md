# 07 — Checklist สร้าง Performance Report ใน Tableau ทีละขั้น
> คู่มือลงมือทำบน **Tableau Desktop 2021.3** ตั้งแต่ต่อข้อมูล → สร้างสูตร → ทำครบ 6 หน้า
> ใช้ไฟล์ตัวอย่างในโฟลเดอร์ [`sample-data/`](sample-data) (CSV 8 ไฟล์ ทดสอบได้ทันทีก่อนได้ข้อมูลจริง)
> อ้างอิงสูตรจาก [`06 - สูตร Measurement`](06%20-%20สูตร%20Measurement%20ผูกกับ%20Data%20Model%20(Tableau%202021.3).md)

---

## 📦 ไฟล์ตัวอย่าง (sample-data/)
| ไฟล์ | บทบาท | จุดเด่น |
|------|-------|---------|
| `FactHolding.csv` | รายการถือครอง (หน้า 5) | 15 แถว · รวม **5,183,612,727.14** ตรงเอกสารจริง · มี USD/AP/AR |
| `FactNAV.csv` | NAV time series (หน้า 3,4) | 40 แถว · NAV/หน่วย 10→22.49 · มี CAPITAL INC/DEC |
| `FactReturn.csv` | ผลตอบแทน (หน้า 1,2) | POINT 8 ช่วง + FY 4 ปี |
| `DimFund.csv` | ทะเบียนกอง | 2 กอง (ทดสอบ dropdown) · มี `client_code_raw` มี prefix M |
| `DimAssetClass.csv` | ลำดับชั้นสินทรัพย์ | 14 รหัส (ก)/(ข)/AP/AR/FORWARDS |
| `DimCurrency.csv` / `DimAccountType.csv` / `DimBenchmark.csv` | มิติเสริม | |

> 💡 มี 2 กอง (4900-2013, 4900-1001) เพื่อทดสอบตัวกรองกองทุน

---

## ✅ STEP 1 — ต่อข้อมูลและสร้าง Data Model (Relationships)
- [ ] เปิด Tableau → **Connect → Text file** → เลือก `FactHolding.csv`
- [ ] ลาก `DimFund.csv` เข้ามาข้างๆ → จะขึ้นหน้าต่าง Edit Relationship
- [ ] **ก่อนเชื่อม** สร้าง field normalize คีย์ก่อน: ที่ตาราง FactHolding คลิกลูกศร field `Client Code` ... จริงๆ ทำเป็น Relationship Calculation ได้เลย (ดูข้อย่อย)
- [ ] เชื่อม **FactHolding ↔ DimFund**:
  - ฝั่งซ้าย เลือก **Create Relationship Calculation** ใส่:
    ```
    IF STARTSWITH([Client Code],"M") THEN MID([Client Code],2) ELSE [Client Code] END
    ```
  - ฝั่งขวา เลือก `fund_key`
- [ ] เชื่อม **FactHolding ↔ DimAssetClass**: `Group` = `asset_class_key`
- [ ] เชื่อม **FactHolding ↔ DimCurrency**: `Trans. Ccy.` = `currency_key`
- [ ] เชื่อม **FactHolding ↔ DimAccountType**: `Account Type` = `account_type_key`
- [ ] ลาก `FactNAV.csv` เชื่อม **↔ DimFund**: `fund_key` = `fund_key`
- [ ] ลาก `FactReturn.csv` เชื่อม **↔ DimFund** (`fund_key`) และ **↔ DimBenchmark** (`benchmark_key`)
- [ ] ตรวจ: ควรเห็น noodle (เส้นโค้ง) ไม่ใช่ Venn (join) — ถ้าเป็น Venn ให้ลบแล้วลากใหม่ที่ระดับ logical

> ⚠️ **อย่าใช้ Join** ข้าม fact — Relationships เท่านั้น ถึงจะคำนวณ NAV/return/holding คนละเกรนได้ถูกโดยไม่ซ้ำซ้อน

---

## ✅ STEP 2 — สร้าง Parameters
สร้างจาก pane ซ้ายล่าง → ลูกศร → Create Parameter
- [ ] `As-Of Date` (Date) → Value when opens = **Dynamic**: Maximum of `[date]` (FactNAV)
- [ ] `NAV Mode` (String, List): `NAV (THB)`, `NAV per Unit`
- [ ] `Period` (String, List): `1M,3M,6M,1Y,3Y,5Y,10Y,SI`
- [ ] `Annualization Factor` (Integer): default **12**
- [ ] `Risk-Free Rate` (Float): default **0.025**

---

## ✅ STEP 3 — สร้าง Calculated Fields (ก๊อปจากเอกสาร 06)
Analysis → Create Calculated Field ทีละตัว (ตั้งชื่อตามหัวข้อในวงเล็บ)
**ชุดพื้นฐาน (ต้องมี):**
- [ ] `Market Value (THB)` = `SUM([Equivalent to THB Amount.])`
- [ ] `%NAV` (LOD — ข้อ 2.3)
- [ ] `NAV Display` (ข้อ 3.1, ผูก `NAV Mode`)
- [ ] `Net Cash Flow` = `SUM([cash_in_out])`

**ชุดผลตอบแทน (วิธี A — จาก FactReturn):**
- [ ] `Port Return %` = `AVG([port_return_pct])`
- [ ] `BM Return %` = `AVG([bm_return_pct])`
- [ ] `Active Return` = `AVG([port_return_pct]) - AVG([bm_return_pct])`

**ชุดวิเคราะห์เพิ่ม (วิธี B/Phase 2 — ถ้าต้องการ):**
- [ ] `Daily Return` (Table Calc, ข้อ 4.B.1)
- [ ] `Annualized Volatility (SD)` (ข้อ 5.1)
- [ ] `Drawdown` / `Max Drawdown` (ข้อ 5.7)
- [ ] `Fiscal Year` (ข้อ 6.2)

---

## ✅ STEP 4 — สร้างแต่ละหน้า (Worksheet)

### หน้า 5 — สัดส่วนสินทรัพย์ (เริ่มจากหน้านี้ ตรวจง่ายสุด)
- [ ] Worksheet ใหม่ → ลาก `group_main` ลง Rows, `asset_class_name` ลง Rows (ถัดไป)
- [ ] ลาก `Market Value (THB)` และ `%NAV` ลง Text/Columns
- [ ] กรอง `fund_key` = 4900-2013
- [ ] **ตรวจ tie-out:** ผลรวม Market Value ต้อง = **5,183,612,727.14** และ Σ%NAV = **100%** ✓
- [ ] ทำ Donut: Marks = Pie ตาม `group_main` หรือใช้ 2 วง (ดูเทคนิค donut)

### หน้า 1 — ผลตอบแทนปักหมุด
- [ ] ลาก `period_label` ลง Columns (เรียง 1M→SI), `Measure Names` ลง Rows
- [ ] กรอง `period_type` = POINT, `as_of_date` = `[As-Of Date]`
- [ ] วาง `Port Return %`, `BM Return %`, `port_volatility_pct`, `bm_volatility_pct`

### หน้า 2 — ผลตอบแทนตามช่วงเวลา
- [ ] กรอง `period_type` = FY → ลาก `period_label` (FY) ลง Columns
- [ ] `Port Return %` และ `BM Return %` เป็นแท่งคู่ (Measure Names → Color)

### หน้า 3 — กราฟ NAV
- [ ] ลาก `date` (Exact Date, continuous) ลง Columns, `NAV Display` ลง Rows
- [ ] กรอง `fund_key`; เพิ่ม `NAV Mode` ลง parameter control เพื่อสลับ
- [ ] ลาก `fund_key` ลง Color เพื่อเทียบหลายกอง (Legend)

### หน้า 4 — การเคลื่อนไหวเงินลงทุน
- [ ] ตาราง: `date` ลง Rows + `nav_thb`, `units_outstanding`, `nav_per_unit`, `Net Cash Flow`, `capital_event`
- [ ] เรียงวันที่จากใหม่→เก่า; ใส่สี `capital_event` (INCREASE เขียว / DECREASE แดง)

### หน้า 00 — ภาพรวม (ทำหลังสุด)
- [ ] สร้าง BANs (Big Numbers): NAV, NAV/หน่วย, Return 1Y, Volatility 1Y
- [ ] ย่อกราฟแท่ง (หน้า1) + donut (หน้า5) มาวางรวม

---

## ✅ STEP 5 — ประกอบ Dashboard + Story
- [ ] Dashboard ใหม่ ขนาด **Automatic** หรือ 1200×จัดแนวตั้ง
- [ ] ใส่ Navigation: ปุ่ม/แท็บ ไป 6 หน้า (Dashboard → Navigation object)
- [ ] วาง parameter controls (As-Of Date, Period, NAV Mode) ที่หัว Dashboard
- [ ] ใส่กล่อง "เรื่องเล่า" ด้วย Text object (ตาม [`04 Storytelling`](04%20-%20Dashboard%20Design%20&%20Data%20Storytelling.md))
- [ ] สี/ฟอนต์: navy `#16314f` = กองทุน, gold `#b8893b` = ดัชนี (คงที่ทุกหน้า ตาม IBCS)
- [ ] (ทางเลือก) Story point: Tableau Story เรียง 6 หน้าเป็นลำดับเล่าเรื่อง

---

## ✅ STEP 6 — ตรวจสอบคุณภาพ (ก่อนใช้จริง)
- [ ] **Tie-out 1:** Σ Market Value หน้า 5 = NAV หน้า 3/4 วันเดียวกัน
- [ ] **Tie-out 2:** Σ %NAV = 100.00%
- [ ] **GIPS check:** ช่วง 1M/3M/6M ไม่ถูก annualize
- [ ] **ทศนิยม:** ตั้ง Number Format ที่ field (6 เก็บ/2 แสดง) — ไม่ ROUND ในสูตร
- [ ] **Filter กอง:** สลับ 4900-2013 ↔ 4900-1001 ตัวเลขเปลี่ยนถูก
- [ ] **(ใช้จริง) RBAC:** ตั้ง User Filter ตาม `USERNAME()` ก่อน publish ขึ้น Server/Cloud

---

## 🔁 STEP 7 — เปลี่ยนจาก CSV ตัวอย่าง → ข้อมูลจริง
- [ ] เตรียมข้อมูลจริงให้มี **โครงสร้างคอลัมน์เดียวกับ CSV ตัวอย่าง** (ผ่าน pipeline/ETL ตามเอกสาร 03 ข้อ F4)
- [ ] Tableau → Data Source → **Edit Connection / Replace Data Source** ชี้ไปข้อมูลจริง
- [ ] เนื่องจากชื่อคอลัมน์เหมือนเดิม → **สูตรและ Dashboard ใช้ได้ทันที ไม่ต้องแก้**

---

## 🗺️ ลำดับแนะนำสำหรับมือใหม่
1️⃣ STEP 1 (ต่อข้อมูล) → 2️⃣ ทำ **หน้า 5** ให้ tie-out ก่อน (มั่นใจว่า model ถูก) → 3️⃣ STEP 2-3 (param+สูตร) → 4️⃣ ทำหน้า 1,3,4 → 5️⃣ ประกอบ Dashboard → 6️⃣ ตรวจ QA

---
*จัดทำโดยทีมข้อมูล DGSI — ทำตามทีละ checkbox · ติดตรงไหนเปิดเอกสาร 06 ดูสูตรเต็ม หรือ 04/05 ดูหน้าตาเป้าหมาย*
