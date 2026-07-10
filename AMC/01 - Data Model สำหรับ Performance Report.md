# 01 — Data Model สำหรับ Performance Report (AMC)
> โมเดลข้อมูลแบบ **Star Schema** สำหรับรายงานผลการดำเนินงานการลงทุน ศูนย์บริหารสินทรัพย์ (AMC)
> สังเคราะห์จาก `การคำนวณสัดส่วนลงทุน.xlsx` (sheet **Raw**) + `Performance Report Requirements.doc` (ตารางแม่ Client และ Asset Class)

---

## 1. ภาพรวม: รายงาน 5 หน้า → ต้องการ Fact อะไร

| หน้า | เนื้อหา | Fact ที่ป้อน | แหล่งข้อมูล |
|------|---------|-------------|-------------|
| 1 | ผลตอบแทนเทียบ BM แบบ **ปักหมุด** (1M–10Y, since inception) | `FactReturn` | Performance / Benchmark files (email KBank) |
| 2 | ผลตอบแทนเทียบ BM **ตามช่วงเวลา** (เดือน/ไตรมาส/ปี/FY) + กราฟ | `FactReturn` | Performance / Benchmark files |
| 3 | กราฟ **NAV (THB) / NAV per Unit** หลายกอง | `FactNAV` | Unit Movement / Performance files |
| 4 | **รายการเคลื่อนไหวเงินลงทุน** (unit movement) | `FactNAV` (+คอลัมน์ movement) | Unit Movement Report |
| 5 | **กลุ่มและสัดส่วนสินทรัพย์ที่ถือครอง** | `FactHolding` ⭐ | `การคำนวณสัดส่วนลงทุน.xlsx` (Raw) |

> ⭐ ไฟล์ Raw ที่อ่านมานี้คือแหล่งหลักของ **`FactHolding`** (หน้า 5) และยังใช้ตรวจยอด NAV รวมของหน้า 3 ได้

---

## 2. แผนผัง Star Schema (ระดับแนวคิด)

```
                       ┌────────────────┐
                       │   DimDate       │
                       │ (calendar/FY)   │
                       └───────┬────────┘
                               │
   ┌────────────┐      ┌───────┴─────────┐      ┌──────────────────┐
   │  DimFund   │──────┤   FACT TABLES   ├──────┤  DimSecurity     │
   │ (Client)   │      │  FactHolding    │      │ (หลักทรัพย์รายตัว) │
   └────────────┘      │  FactNAV        │      └────────┬─────────┘
        │              │  FactReturn     │               │
        │              └───┬────────┬────┘      ┌─────────┴─────────┐
   ┌────┴───────┐          │        │           │  DimAssetClass    │
   │ DimPlan    │     ┌────┴───┐ ┌──┴──────┐    │ (ก)/(ข) hierarchy │
   │(มั่งมี/ยั่งยืน)│   │DimCcy  │ │DimAccount│   └───────────────────┘
   └────────────┘     └────────┘ │  Type   │    ┌───────────────────┐
                                 └─────────┘    │  DimBenchmark     │
                                                └───────────────────┘
```

---

## 3. Fact Tables

### 3.1 `FactHolding` — รายการถือครองหลักทรัพย์ ⭐ (จาก Raw sheet)
**Grain:** 1 แถว = 1 หลักทรัพย์ ที่ถือครองโดย 1 กองทุน ณ 1 วันที่ snapshot

| คอลัมน์โมเดล | มาจาก Raw column | ชนิด | หมายเหตุ |
|---------------|------------------|------|----------|
| `date_key` (FK) | Raw Portfolio Date | date | snapshot date (ไฟล์ตัวอย่าง = 30/9/2024) |
| `fund_key` (FK) | Client Code | text | join DimFund (ต้องตัด prefix `M`) |
| `security_key` (FK) | Security Code | text | join DimSecurity |
| `asset_class_key` (FK) | **Group** | text | join DimAssetClass เช่น `(ก) 9)`, `(ข) 5)d.`, `FORWARDS`, `AP`, `AR` |
| `account_type_key` (FK) | Account Type | text | INVEST / AP / AR |
| `currency_key` (FK) | Trans. Ccy. | text | THB, USD, SGD, EUR, AUD, HKD, JPY, GBP, CNY |
| `units` | Units | number(,6) | จำนวนหน่วย/หน้าตราสาร |
| `total_cost_amount` | Total Cost Amount | number(,2) | ราคาทุน (รวม accrued) |
| `local_cost_amount` | Local Cost Amount. | number(,2) | ทุนสกุลเดิม |
| `accrued_int` | Accrued Int. | number(,2) | ดอกเบี้ยค้างรับ |
| `mkt_price_unit` | Mkt. Price/Unit | number(,6) | ราคาตลาดต่อหน่วย |
| `market_amount_clean` | Market Amount (Clean) | number(,2) | มูลค่าตลาด (ไม่รวมดอกค้าง) |
| `total_market_amount` | Total Market Amount | number(,2) | มูลค่าตลาดรวม (สกุลธุรกรรม) |
| `local_market_amount` | Local Market Amount. | number(,2) | มูลค่าตลาดสกุลเดิม |
| `fx_rate` | FX. Rate | number(,6) | =1 ถ้า THB |
| `thb_equiv_amount` | Equivalent to THB Amount. | number(,2) | **ใช้รวม NAV / คิด %NAV** |
| `pct_nav` | %NAV | number(,6) | สัดส่วนต่อ NAV กอง |
| `pct_portfolio` | % of Portfolio | number(,6) | สัดส่วนต่อพอร์ต |
| `avg_coupon` | Average Coupon (%) | number(,6) | ตราสารหนี้ |
| `avg_ytm` | Average YTM (%) | number(,6) | ตราสารหนี้ |
| `avg_book_yield` | Average Book Yield (%) | number(,6) | |
| `mtm_rm` | MTM RM (%) | number(,6) | |
| `duration` | Duration | number(,6) | *(ว่างในไฟล์ตัวอย่าง — เติมภายหลัง)* |
| `convexity` | Convexity | number(,6) | *(ว่างในไฟล์ตัวอย่าง)* |
| `notional_amount` | Notional Amount. | number(,2) | อนุพันธ์ |
| `maturity_date` | Maturity Date | date | degenerate / โยง DimSecurity |

> คอลัมน์ที่ "ว่างทั้งหมด" ในไฟล์ตัวอย่าง (Institute, Investment, Investment Group, Action, Ccy.Pair, Short/Borrow/Lend/Collateral/Pledge Units, Futures*, Total Short, XI/XD, XA/XN) → **เก็บไว้ใน staging แต่ไม่นำเข้า model** จนกว่าจะมีข้อมูลจริง

**Measures หลักของหน้า 5:** `thb_equiv_amount` (Market Value), `pct_nav` → group by `asset_class_key`

---

### 3.2 `FactNAV` — มูลค่าทรัพย์สินสุทธิและการเคลื่อนไหว (หน้า 3, 4)
**Grain:** 1 แถว = 1 กองทุน ณ 1 วันที่ (time series รายวัน/สัปดาห์)

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|----------|
| `date_key` (FK) | date | |
| `fund_key` (FK) | text | |
| `nav_thb` | number(,2) | มูลค่าทรัพย์สินสุทธิ (บาท) |
| `units_outstanding` | number(,4) | จำนวนหน่วยลงทุน |
| `nav_per_unit` | number(,4) | มูลค่าต่อหน่วย |
| `dividend_total` | number(,2) | เงินปันผล (บาท) |
| `dividend_per_unit` | number(,4) | เงินปันผลต่อหน่วย |
| `unit_movement` | number(,4) | การเปลี่ยนแปลงหน่วย |
| `cash_in_out` | number(,2) | เงินเข้า-ออก (บาท) |
| `capital_event` | text | CAPITAL INCREASE / DECREASE / (ว่าง) |

> ❗ ไม่ได้อยู่ใน Raw — มาจาก `UNIT MOVEMENT REPORT_*.xlsx` / `Performance_*.xls`. ใส่ในโมเดลเพราะหน้า 3–4 ต้องใช้

---

### 3.3 `FactReturn` — ผลตอบแทนและความผันผวน (หน้า 1, 2)
**Grain:** 1 แถว = 1 กองทุน × 1 ชนิดช่วงเวลา × 1 ค่าสิ้นสุด (as-of date)

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|----------|
| `as_of_date_key` (FK) | date | วันสิ้นสุดที่ใช้คำนวณ |
| `fund_key` (FK) | text | |
| `benchmark_key` (FK) | text | join DimBenchmark |
| `period_type` | text | POINT (1M/3M/6M/1Y/3Y/5Y/10Y/SI) หรือ PERIOD (month/quarter/calendar/FY) |
| `period_label` | text | เช่น `1M`, `FY2567`, `2025-Q2` |
| `port_return_pct` | number(,6) | แสดง 2 ตำแหน่ง |
| `bm_return_pct` | number(,6) | rebase NAV/unit=10; เฉพาะรายเดือน |
| `port_volatility_pct` | number(,6) | annualized (SD×√12) |
| `bm_volatility_pct` | number(,6) | annualized; เฉพาะรายเดือน |
| `is_annualized` | bool | true สำหรับ ≥1Y |

> ❗ เป็น Fact "กึ่งคำนวณ" — สร้างจาก `FactNAV` (NAV/unit) + ไฟล์ `Benchmark_FYyyyy.xlsx` ตามสูตรในสเปก

---

## 4. Dimension Tables

### 4.1 `DimFund` (Client / กองทุน) — จากตารางแม่ "Port Summary by Class"
| คอลัมน์ | ตัวอย่าง | หมายเหตุ |
|---------|----------|----------|
| `fund_key` (PK) | `4900-2013` | normalize: ตัด `M`, ใช้รูป `xxxx-xxxx` |
| `client_code_raw` | `M3003-5010` | เก็บค่าดิบไว้ trace |
| `fund_category` | AMC / SI / SiPH / RA | ประเภทผู้บริหาร/กลุ่ม |
| `division` (ส่วนงาน) | บัณฑิตวิทยาลัย | คณะ/หน่วยงานเจ้าของเงิน |
| `liquidity_type` | หมุนเวียน / ไม่หมุนเวียน | ใช้แยกรายงาน |
| `plan` (แผน) | มั่งมี / ยั่งยืน / อุ่นใจ / OP1–OP15 | แผนการลงทุน |
| `fund_name` | มหาวิทยาลัยมหิดล บัณฑิตวิทยาลัย | ชื่อแสดงผล |
| `inception_date` | (เติม) | ใช้คำนวณ since inception |
| `is_aggregate` | bool | กองรวม เช่น MU_CA+NONC |

> ⚠️ **กฎ mapping สำคัญ (ดูคำถาม H5):** Raw ใช้ `M4900-xxxx`/`M3xxx-xxxx`; ตารางแม่ใช้ `4900-xxxx`/`3xxx-xxxx` → ต้อง normalize ก่อน join

### 4.2 `DimSecurity` (หลักทรัพย์รายตัว) — จาก Raw
| คอลัมน์ | มาจาก Raw |
|---------|-----------|
| `security_key` (PK) | Security Code |
| `isin_code` | ISIN Code |
| `security_class` | Security Class (BOND/EQ/CASH/MM/UNIT TRUST/DERIVATIVE) |
| `security_type` | Security Type (~65 ชนิด เช่น CP-BOND-S, GOV-BOND, UT-BL) |
| `issuer` | Issuer/Counter Party |
| `rating_tris` | Rating TRIS |
| `rating_fitch` | Rating FITCH |
| `maturity_date` | Maturity Date |
| `int_frequency` | Int. Frequency (H/Q/M/Y/T…) |
| `default_coupon` | Average Coupon (%) |

### 4.3 `DimAssetClass` (ลำดับชั้นกลุ่มสินทรัพย์) — จากตาราง map (ก)/(ข)
| คอลัมน์ | ตัวอย่าง | หมายเหตุ |
|---------|----------|----------|
| `asset_class_key` (PK) | `(ก) 9)` | รหัสกลุ่มตามกฎ ก.ล.ต./นโยบาย |
| `group_main` | ตราสารหนี้ | ระดับบนสุด (หน้า 5 ใช้เป็นหัวข้อ) |
| `asset_class_name` | ตราสารหนี้รัฐวิสาหกิจ/หุ้นกู้บริษัทเอกชน | ระดับย่อยที่แสดง |
| `sort_order` | 9 | จัดเรียงในตาราง/กราฟวงกลม |

**กลุ่มหลัก (group_main):** ตราสารหนี้ · ตราสารทุน · อสังหาริมทรัพย์ · สินค้าโภคภัณฑ์ · ตราสารอนุพันธ์ · เจ้าหนี้/ลูกหนี้/ค่าใช้จ่าย
**ค่าพิเศษ (ไม่ใช่ (ก)/(ข)):** `AP`, `AR` → เจ้าหนี้/ลูกหนี้ · `FORWARDS`, `SWAP` → อนุพันธ์

### 4.4 `DimDate`
- ระดับ: วัน → เดือน → ไตรมาส → ปีปฏิทิน → **ปีงบประมาณ (ต.ค.–ก.ย.)**
- จำเป็นต้องมี FY เพราะหน้า 2 แสดง "อัตราผลตอบแทนรายปีงบประมาณ FY2564–2567"
- attribute: `is_month_end`, `is_quarter_end`, `is_fy_end`, `fiscal_year` (พ.ศ.)

### 4.5 `DimCurrency`
| คอลัมน์ | ค่า |
|---------|-----|
| `currency_key` (PK) | THB, USD, SGD, EUR, AUD, HKD, JPY, GBP, CNY |
| `is_domestic` | THB = true |

### 4.6 `DimAccountType`
| `account_type_key` | ความหมาย |
|--------------------|----------|
| INVEST | เงินลงทุน |
| AP | เจ้าหนี้ (Account Payable) — ค่าใช้จ่ายค้างจ่าย |
| AR | ลูกหนี้ (Account Receivable) |

### 4.7 `DimBenchmark`
| คอลัมน์ | หมายเหตุ |
|---------|----------|
| `benchmark_key` (PK) | ผูกกับกอง/แผน |
| `benchmark_name` | ดัชนีชี้วัด |
| `rebase_base_nav` | 10.00 (NAV/unit since inception) |
| `frequency` | MONTHLY (สเปกระบุ BM มีเฉพาะรายเดือน) |

---

## 5. ความสัมพันธ์ (Relationships)

| Fact | → Dimension | Cardinality | Key |
|------|-------------|-------------|-----|
| FactHolding | DimDate | many-to-1 | date_key |
| FactHolding | DimFund | many-to-1 | fund_key |
| FactHolding | DimSecurity | many-to-1 | security_key |
| FactHolding | DimAssetClass | many-to-1 | asset_class_key (= Raw "Group") |
| FactHolding | DimCurrency | many-to-1 | currency_key |
| FactHolding | DimAccountType | many-to-1 | account_type_key |
| FactNAV | DimDate, DimFund | many-to-1 | |
| FactReturn | DimDate, DimFund, DimBenchmark | many-to-1 | |

---

## 6. ตัวอย่างการคำนวณตามหน้าจอ (Semantic Layer / Measures)

```sql
-- หน้า 5: สัดส่วนสินทรัพย์ ของกองที่เลือก ณ วันล่าสุด
SELECT  ac.group_main, ac.asset_class_name,
        SUM(h.thb_equiv_amount)                              AS market_value,
        SUM(h.thb_equiv_amount) / NULLIF(SUM(SUM(h.thb_equiv_amount)) OVER (),0) AS pct_nav
FROM    FactHolding h
JOIN    DimAssetClass ac ON ac.asset_class_key = h.asset_class_key
WHERE   h.fund_key  = :selected_fund
  AND   h.date_key  = :latest_date
GROUP BY ac.group_main, ac.asset_class_name, ac.sort_order
ORDER BY ac.sort_order;

-- NAV รวมของกอง ณ วันที่ (ตรวจยอดหน้า 3 จาก holdings)
SELECT SUM(thb_equiv_amount) AS nav_thb
FROM   FactHolding
WHERE  fund_key = :fund AND date_key = :date;
```

> **Key measures:** `Market Value = Σ thb_equiv_amount` · `%NAV = thb_equiv_amount / NAV กอง` · `NAV = Σ thb_equiv_amount (รวม AP/AR ติดลบ)` · `Return%` และ `Volatility` มาจาก FactReturn ตามสูตรในสเปก (เก็บ 6 แสดง 2 ตำแหน่ง)

---

## 7. Pipeline / ETL ที่ต้องมี (สรุป)

| ขั้น | งาน |
|------|-----|
| 1. Ingest | รับไฟล์ Raw (allocation), Unit Movement, Performance, Benchmark, Port Summary (จาก email/zip KBank) |
| 2. Stage | โหลดทุกคอลัมน์ลง staging (รวมคอลัมน์ว่าง) เก็บ snapshot date |
| 3. Conform | normalize Client Code (ตัด `M`), map Group→AssetClass, แปลงตัวเลขจาก text มี comma |
| 4. Load | เติม Dim → Fact (FactHolding จาก Raw; FactNAV/FactReturn จากไฟล์อื่น) |
| 5. Validate | Σ%NAV ≈ 100%, NAV(holdings) ≈ NAV(unit movement), ไม่มี fund_key กำพร้า |
| 6. Serve | semantic layer / API ให้เว็บรายงาน 5 หน้า ตามสิทธิ์ email→fund |

---

## 8. ประเด็นค้าง / ต้องยืนยันกับผู้ใช้ (โยงกับเอกสาร 00)
1. **Client Code mapping** `M3003-5010` ↔ `3003-5010`/`4900-xxxx` (คำถาม H5) — บล็อกการ join
2. ระดับ drill-down หน้า 5: หยุดที่กลุ่ม หรือถึงรายหลักทรัพย์ (D3)
3. duration/convexity ยังว่างในไฟล์ Raw — มาจากไฟล์ไหน/เมื่อไร (D4)
4. FactNAV/FactReturn มาจากไฟล์อื่น (ยังไม่ได้อ่าน) — ต้องขอ schema ของ `UNIT MOVEMENT REPORT_*` และ `Benchmark_FYyyyy.xlsx`
5. ความถี่ snapshot ของ holdings (รายไตรมาส? รายเดือน?) — กระทบ DimDate และ retention (F1, F6)

---
*จัดทำโดยทีมข้อมูล DGSI — โครงสร้างพร้อมต่อยอดเป็น physical schema (PostgreSQL/Power BI/OpenMetadata) ในเอกสารถัดไป*
