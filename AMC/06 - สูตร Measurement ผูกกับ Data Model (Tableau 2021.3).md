# 06 — สูตร Measurement ผูกกับ Data Model (Tableau Desktop 2021.3)
> สูตร Calculated Field พร้อมก๊อปวาง สำหรับสร้าง Performance Report เองบน **Tableau Desktop 2021.3**
> อ้างอิงโครงสร้างจาก [`01 - Data Model`](01%20-%20Data%20Model%20สำหรับ%20Performance%20Report.md) · ตัวชี้วัดตาม [`03 - มาตรฐานสากล`](03%20-%20แนวปฏิบัติสากลสำหรับคำถามที่ยังค้าง%20(International%20Standards%20Reference).md)
> ✅ ทุกฟังก์ชันในเอกสารนี้รองรับบน 2021.3 (Relationships, LOD `{FIXED}`, Table Calc, Dynamic Parameters)

---

## 0. สร้าง Data Model บน Tableau ก่อน (Logical Layer / Relationships)

**ใช้ "Relationships" (เส้นก๋วยเตี๋ยว) ไม่ใช่ Join** — เพราะมี 3 fact ต่างเกรน (FactHolding / FactNAV / FactReturn) ที่ใช้ Dimension ร่วมกัน Relationships จะกัน fan-out/ซ้ำซ้อนให้อัตโนมัติ (ฟีเจอร์ตั้งแต่ 2020.2)

```
DimDate ──┐        ┌── DimSecurity
DimFund ──┼─ FactHolding ─┼── DimAssetClass   (Group = asset_class_key)
          │        └── DimCurrency / DimAccountType
DimFund ──┼─ FactNAV
DimDate ──┘
DimFund/DimDate/DimBenchmark ── FactReturn
```

**ขั้นตอน:** ลาก `FactHolding` ลง canvas → ลาก `DimFund` มาเชื่อม กำหนดคีย์ `Fund Key (Holding) = fund_key` → ทำซ้ำกับ Dim อื่น → ลาก `FactNAV`, `FactReturn` เชื่อมกับ DimFund/DimDate

> ⚠️ **สำคัญ:** คีย์ Client Code ในไฟล์ Raw มี prefix `M` (เช่น `M3003-5010`) แต่ตารางแม่ไม่มี → ต้องสร้าง field normalize ก่อน (ข้อ 1.1) แล้วใช้ field นั้นเป็น **Relationship Calculation** (2021.3 ลาก calculated field มาวางบนเส้น relationship ได้)

---

## 1. Atomic / Key Fields (สร้างก่อน)

### 1.1 `Fund Key` — normalize Client Code (ตัด prefix M)  [แก้ปัญหา H5]
```
// ใช้ในตาราง FactHolding เพื่อจับคู่กับ DimFund.fund_key
IF STARTSWITH([Client Code], "M") THEN MID([Client Code], 2)
ELSE [Client Code] END
```
*ทางเลือก (regex):* `REGEXP_REPLACE([Client Code], "^M", "")`

### 1.2 `As-Of Date` (Parameter)  — วันที่อ้างอิงล่าสุด
- สร้าง Parameter ชนิด Date ชื่อ `As-Of Date`
- ตั้ง **Value when workbook opens → ใช้ Dynamic**: `Maximum of [Raw Portfolio Date]` (2021.3 รองรับ dynamic parameter)

### 1.3 `Is Latest Snapshot` — กรองเฉพาะวันล่าสุด
```
[Raw Portfolio Date] = { FIXED [Fund Key] : MAX([Raw Portfolio Date]) }
```

---

## 2. มูลค่า & สัดส่วน (หน้า 5 — จาก FactHolding)

### 2.1 `Market Value (THB)`
```
SUM([Equivalent to THB Amount.])
```

### 2.2 `NAV (Holdings)` — NAV รวมของกอง (รวม AP/AR ติดลบ)
```
{ FIXED [Fund Key], [Raw Portfolio Date] : SUM([Equivalent to THB Amount.]) }
```

### 2.3 `%NAV` — สัดส่วนต่อ NAV (LOD แบบ robust ไม่ขึ้นกับ viz)
```
SUM([Equivalent to THB Amount.])
/ SUM( { FIXED [Fund Key], [Raw Portfolio Date] : SUM([Equivalent to THB Amount.]) } )
```
> Format: ขวาคลิก field → Default Properties → Number Format → Percentage 2 ตำแหน่ง

### 2.4 `%NAV (เทียบ % of total ใน view)` — ทางเลือกแบบ Table Calc
```
SUM([Equivalent to THB Amount.]) / TOTAL(SUM([Equivalent to THB Amount.]))
```

---

## 3. NAV & การเคลื่อนไหว (หน้า 3, 4 — จาก FactNAV)

### 3.1 `NAV Display` — สลับ NAV(บาท) / NAV ต่อหน่วย (ผูกปุ่ม toggle)
สร้าง Parameter `NAV Mode` (String: `NAV (THB)` / `NAV per Unit`)
```
IF [NAV Mode] = "NAV per Unit" THEN SUM([nav_per_unit])
ELSE SUM([nav_thb]) END
```

### 3.2 `NAV per Unit` (วัด)
```
SUM([nav_per_unit])   // กรณี 1 กอง×1วัน มี 1 แถว; ใช้ MIN/AVG ได้ผลเท่ากัน
```

### 3.3 `Net Cash Flow` — เงินเข้า-ออก
```
SUM([cash_in_out])
```

---

## 4. ผลตอบแทน (หน้า 1, 2)

> 🔑 **มี 2 วิธี — เลือกตามแหล่งข้อมูล**
> - **วิธี A (แนะนำ):** ผลตอบแทน "ปักหมุด/รายช่วง" ดึงจาก **FactReturn** ที่ KBank คำนวณมาแล้ว (ตรงตามสเปก: เก็บ 6 แสดง 2, rebase BM=10) → Tableau แค่แสดง
> - **วิธี B:** คำนวณเองใน Tableau จาก **FactNAV** (NAV/unit time series) ด้วย Table Calc — ยืดหยุ่นกว่าแต่ต้องระวังเรื่องวันหยุด/นับวัน

### วิธี A — จาก FactReturn (พร้อมใช้)
```
// Port Return % (ค่าเดียวต่อ กอง×period×as-of)
AVG([port_return_pct])     // หรือ MIN/ATTR ถ้ามั่นใจว่าไม่ซ้ำ
```
```
// BM Return %
AVG([bm_return_pct])
```
```
// Active Return (กอง - ดัชนี)  [ตัวชี้วัด GIPS-recommended]
AVG([port_return_pct]) - AVG([bm_return_pct])
```
กรองด้วย `[as_of_date_key] = [As-Of Date]` และวาง `[period_label]` บน Columns

### วิธี B — คำนวณเองจาก NAV/unit (Table Calc)

#### 4.B.1 `Daily Return` (รายวัน)
```
( ZN(SUM([nav_per_unit])) - LOOKUP(ZN(SUM([nav_per_unit])), -1) )
/ LOOKUP(SUM([nav_per_unit]), -1)
```
> Table Calc: **Compute Using → [วันที่]**, Partition = [Fund Key]

#### 4.B.2 `Period Cumulative Return` (ผลตอบแทนสะสมในช่วงที่กรอง)
```
( LOOKUP(SUM([nav_per_unit]), LAST()) / LOOKUP(SUM([nav_per_unit]), FIRST()) ) - 1
```

#### 4.B.3 `Since-Inception Return` (rebase ต่อหน่วย = 10)
```
( LOOKUP(SUM([nav_per_unit]), LAST()) / 10 ) - 1
```

#### 4.B.4 `Years in Window` — จำนวนปีในช่วง (ใช้ annualize)
```
DATEDIFF('day',
   { FIXED [Fund Key] : MIN(IF [In Selected Window] THEN [Date] END) },
   [As-Of Date]) / 365.0
```
*(สร้าง `[In Selected Window]` ตามช่วงที่เลือก — ดูข้อ 6.1)*

#### 4.B.5 `Annualized Return` — **เคารพกฎ GIPS: ช่วง <1 ปี ห้าม annualize**
```
IF [Years in Window] >= 1
THEN POWER(1 + [Period Cumulative Return], 1.0/[Years in Window]) - 1
ELSE [Period Cumulative Return]   // ช่วงต่ำกว่า 1 ปี แสดงตามจริง (GIPS 2.A.12)
END
```

---

## 5. ความเสี่ยง / ตัวชี้วัดขั้นสูง (Phase 2 — ตาม GIPS-recommended)

### 5.0 `Annualization Factor` (Parameter, Integer)
- ค่า: **12** (รายเดือน, ตามสเปก `SD × √12`) หรือ **252** (รายวัน)
- สเปก AMC ระบุ `Annualized SD = SD × √12` → ตั้ง default = 12

### 5.1 `Annualized Volatility (SD)` — ความผันผวนต่อปี
```
WINDOW_STDEV([Daily Return]) * SQRT([Annualization Factor])
```
> ใช้ `WINDOW_STDEV` (sample SD); ถ้าต้องการ population ใช้ `WINDOW_STDEVP`

### 5.2 `Risk-Free Rate` (Parameter, Float) — เช่น 0.025

### 5.3 `Sharpe Ratio`
```
([Annualized Return] - [Risk-Free Rate]) / [Annualized Volatility (SD)]
```

### 5.4 `Active Daily Return` (สำหรับ Tracking Error)
```
[Daily Return] - [BM Daily Return]
// [BM Daily Return] = สร้างแบบเดียวกับ 4.B.1 แต่ใช้ NAV/unit ของ benchmark (rebase=10)
```

### 5.5 `Tracking Error`
```
WINDOW_STDEV([Active Daily Return]) * SQRT([Annualization Factor])
```

### 5.6 `Information Ratio`
```
([Annualized Return] - [Annualized BM Return]) / [Tracking Error]
```

### 5.7 `Drawdown` & `Max Drawdown` (Table Calc)
```
// Drawdown ณ แต่ละจุด = NAV/unit ปัจจุบัน / จุดสูงสุดสะสม - 1
SUM([nav_per_unit]) / RUNNING_MAX(SUM([nav_per_unit])) - 1
```
```
// Max Drawdown = จุดต่ำสุดของ Drawdown ตลอดช่วง
WINDOW_MIN(
   SUM([nav_per_unit]) / RUNNING_MAX(SUM([nav_per_unit])) - 1
)
```
> Compute Using → [วันที่], Partition = [Fund Key]

---

## 6. Parameters & ตัวกรอง (ผูกกับ Dropdown ในต้นแบบ)

### 6.1 `Period Selector` (Parameter, String) + `In Selected Window`
Parameter `Period` ค่า: `1M, 3M, 6M, 1Y, 3Y, 5Y, 10Y, SI`
```
// In Selected Window — true ถ้าวันที่อยู่ในช่วงที่เลือก (นับถอยจาก As-Of Date)
[Date] >= CASE [Period]
   WHEN "1M"  THEN DATEADD('month', -1,  [As-Of Date])
   WHEN "3M"  THEN DATEADD('month', -3,  [As-Of Date])
   WHEN "6M"  THEN DATEADD('month', -6,  [As-Of Date])
   WHEN "1Y"  THEN DATEADD('year',  -1,  [As-Of Date])
   WHEN "3Y"  THEN DATEADD('year',  -3,  [As-Of Date])
   WHEN "5Y"  THEN DATEADD('year',  -5,  [As-Of Date])
   WHEN "10Y" THEN DATEADD('year',  -10, [As-Of Date])
   WHEN "SI"  THEN { FIXED [Fund Key] : MIN([Date]) }
END
AND [Date] <= [As-Of Date]
```
ใช้ field นี้บน Filters (= True)

### 6.2 `Fiscal Year (ปีงบประมาณ ต.ค.–ก.ย.)` — สำหรับหน้า 2
```
IF MONTH([Date]) >= 10
THEN YEAR([Date]) + 1 + 543      // +543 เป็น พ.ศ.
ELSE YEAR([Date]) + 543 END
```

### 6.3 `Fund Filter` — ผูก RBAC (เห็นกองตามสิทธิ์)
ใช้ **User Filter** หรือ `USERNAME()` แมปกับตารางสิทธิ์ email→fund:
```
[Allowed User] = USERNAME()
```
(กรองให้เห็นเฉพาะกองที่ email ตนเองมีสิทธิ์)

---

## 7. แผนผังผูก "สูตร → หน้า Dashboard" (เอกสาร 04/05)

| หน้า | ใช้ Field/สูตร | ตารางต้นทาง |
|------|---------------|-------------|
| **00 ภาพรวม** | `NAV (Holdings)`, `NAV per Unit`, `Since-Inception Return`, `Annualized Return` (1Y), `Active Return`, `Annualized Volatility` | FactHolding + FactNAV + FactReturn |
| **01 ปักหมุด** | `Port Return %`, `BM Return %`, `Annualized Volatility` × [period_label] | FactReturn (วิธี A) |
| **02 ตามช่วงเวลา** | `Port Return %` / `BM Return %` × `Fiscal Year` | FactReturn |
| **03 กราฟ NAV** | `NAV Display` (ผูก `NAV Mode`) × [Date] | FactNAV |
| **04 เคลื่อนไหว** | `NAV per Unit`, `Net Cash Flow`, `capital_event` | FactNAV |
| **05 สัดส่วน** | `Market Value (THB)`, `%NAV` × `group_main` → drill `asset_class_name` → `Security Code` | FactHolding + DimAssetClass + DimSecurity |

---

## 8. หมายเหตุความเข้ากันได้ (Tableau 2021.3)
- ✅ `{FIXED}` LOD, `TOTAL`, `WINDOW_*`, `RUNNING_MAX`, `LOOKUP`, `FIRST/LAST`, `POWER`, `ZN`, `STARTSWITH`, `MID`, `REGEXP_REPLACE`, `DATEADD/DATEDIFF`, **Dynamic Parameters** — รองรับครบ
- 🔢 **กฎทศนิยม (เก็บ 6 แสดง 2):** เก็บค่าเต็มไว้ในข้อมูล แล้วตั้ง Number Format ที่ field (ไม่ใช้ `ROUND` ในสูตร เพื่อไม่ให้สะสม error)
- ⚠️ **Table Calc** (Daily Return, Drawdown, Period Return) ต้องตั้ง **Compute Using / Partition** ให้ถูก: addressing = [Date], partition = [Fund Key] เสมอ
- ⚠️ **annualize เฉพาะ >12 เดือน** (ข้อ 4.B.5) — อย่าลืมเงื่อนไข GIPS สำหรับ 1M/3M/6M
- 💡 ถ้า FactReturn มาพร้อมจาก KBank → ใช้ "วิธี A" จะตรงกับเลขทางการที่สุด (กัน mismatch ตามข้อ H1)

---
*จัดทำโดยทีมข้อมูล DGSI — ป๊าก๊อปสูตรไปวางใน Tableau > Analysis > Create Calculated Field ได้เลย · ตั้งชื่อ field ตามหัวข้อ (ในวงเล็บ ``) เพื่อให้อ้างถึงกันได้ถูก*
