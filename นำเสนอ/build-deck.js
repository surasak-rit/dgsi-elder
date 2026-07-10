const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "ศูนย์ DGSI";
pres.title = "ข้อเสนอเชิงยุทธศาสตร์ต่อผู้บริหาร — ศูนย์ DGSI";

// ---------- palette ----------
const DARK = "0E2A3B";   // deep teal-navy (title/closing bg)
const TEAL = "0F6E56";   // primary deep teal
const TEALB = "1D9E75";  // bright teal (target/accent)
const CORAL = "D85A30";  // current state / gaps
const AMBER = "BA7517";
const SOFT = "EAF3EF";   // soft teal tint card
const SOFT2 = "F4F1EA";  // soft sand tint
const TEXT = "1A2B33";
const MUTED = "5F6B70";
const WHITE = "FFFFFF";
const LINE = "D7E0DC";

const F = "Tahoma";
const PW = 13.33, PH = 7.5, M = 0.62;

const mkShadow = () => ({ type: "outer", color: "1A2B33", blur: 7, offset: 3, angle: 90, opacity: 0.12 });

// content-slide header
function header(slide, kicker, title) {
  slide.background = { color: WHITE };
  slide.addText(kicker, { x: M, y: 0.42, w: 12, h: 0.32, fontFace: F, fontSize: 12, color: TEAL, bold: true, charSpacing: 2, margin: 0 });
  slide.addText(title, { x: M, y: 0.72, w: 12.1, h: 0.7, fontFace: F, fontSize: 26, color: TEXT, bold: true, margin: 0 });
}
function pageNum(slide, n) {
  slide.addText(String(n), { x: PW - 0.9, y: PH - 0.5, w: 0.5, h: 0.3, fontFace: F, fontSize: 10, color: MUTED, align: "right", margin: 0 });
  slide.addText("ศูนย์ธรรมาภิบาลข้อมูลและยุทธศาสตร์อัจฉริยะ (DGSI)", { x: M, y: PH - 0.5, w: 8, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, margin: 0 });
}

// ========================================================== SLIDE 1 — TITLE
let s = pres.addSlide();
s.background = { color: DARK };
// motif: concentric ring top-right
s.addShape(pres.shapes.OVAL, { x: 10.6, y: -1.6, w: 4.6, h: 4.6, line: { color: TEALB, width: 1.5, transparency: 55 }, fill: { type: "none" } });
s.addShape(pres.shapes.OVAL, { x: 11.4, y: -0.8, w: 3.0, h: 3.0, line: { color: TEALB, width: 1.5, transparency: 35 }, fill: { type: "none" } });
s.addShape(pres.shapes.OVAL, { x: 12.0, y: -0.2, w: 1.8, h: 1.8, fill: { color: TEALB, transparency: 80 }, line: { type: "none" } });
s.addText("เอกสารเสนอผู้บริหารระดับสูง", { x: M, y: 2.05, w: 11, h: 0.4, fontFace: F, fontSize: 14, color: TEALB, bold: true, charSpacing: 3, margin: 0 });
s.addText("ศูนย์ธรรมาภิบาลข้อมูลและยุทธศาสตร์อัจฉริยะ", { x: M, y: 2.5, w: 11.5, h: 0.9, fontFace: F, fontSize: 38, color: WHITE, bold: true, margin: 0 });
s.addText([
  { text: "ความได้เปรียบเชิงยุทธศาสตร์ ", options: { color: "CFE6DD" } },
  { text: "และเป้าหมายสู่ความเป็นเลิศ (Outstanding)", options: { color: TEALB } },
], { x: M, y: 3.5, w: 11.5, h: 0.6, fontFace: F, fontSize: 22, bold: true, margin: 0 });
s.addShape(pres.shapes.LINE, { x: M, y: 4.4, w: 2.2, h: 0, line: { color: TEALB, width: 2.5 } });
s.addText("ประเมินสถานะปัจจุบัน · นิยามความเป็นเลิศ · แผนดำเนินการ 2 ปี", { x: M, y: 4.6, w: 11, h: 0.4, fontFace: F, fontSize: 14, color: "AFC6BE", margin: 0 });
s.addText([
  { text: "เสนอต่อ  ", options: { color: "7E9A91" } },
  { text: "อธิการบดี · รองอธิการบดี · สภามหาวิทยาลัย", options: { color: "CFE6DD", bold: true } },
], { x: M, y: 6.5, w: 9, h: 0.4, fontFace: F, fontSize: 13, margin: 0 });
s.addText("มิถุนายน 2569", { x: PW - 3.0, y: 6.5, w: 2.4, h: 0.4, fontFace: F, fontSize: 13, color: "CFE6DD", align: "right", margin: 0 });

// ========================================================== SLIDE 2 — EXEC SUMMARY
s = pres.addSlide();
header(s, "บทสรุปผู้บริหาร", "ทำไมมหาวิทยาลัยจึงต้องมีศูนย์ฯ นี้");
s.addText([
  { text: "ข้อมูลคือสินทรัพย์เชิงยุทธศาสตร์", options: { bold: true, color: TEAL, breakLine: true } },
  { text: "ไม่ต่างจากบุคลากรหรืองบประมาณ ศูนย์ DGSI คือกลไกกำกับระดับองค์กรที่เปลี่ยนการตัดสินใจจาก ‘ประสบการณ์และสัญชาตญาณ’ สู่ ‘หลักฐานเชิงข้อมูลที่ตรวจสอบได้’", options: { color: TEXT } },
], { x: M, y: 1.7, w: 6.0, h: 1.6, fontFace: F, fontSize: 15, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 3.55, w: 6.0, h: 2.9, fill: { color: SOFT }, line: { color: LINE, width: 1 }, rectRadius: 0.12 });
s.addText("ใจความหลักในประโยคเดียว", { x: M + 0.3, y: 3.8, w: 5.4, h: 0.35, fontFace: F, fontSize: 12, color: TEAL, bold: true, margin: 0 });
s.addText([
  { text: "ศูนย์ฯ นี้คือการลงทุนที่เปลี่ยน ", options: {} },
  { text: "ความเสี่ยงด้านข้อมูล", options: { bold: true, color: CORAL } },
  { text: " (PDPA · ข้อมูลรั่วไหล · ตัดสินใจผิดพลาด) ให้กลายเป็น ", options: {} },
  { text: "ความได้เปรียบในการแข่งขัน", options: { bold: true, color: TEAL } },
  { text: " (อันดับมหาวิทยาลัย · ประสิทธิภาพ · ความเชื่อมั่น)", options: {} },
], { x: M + 0.3, y: 4.2, w: 5.4, h: 2.0, fontFace: F, fontSize: 16, color: TEXT, lineSpacingMultiple: 1.2, valign: "top", margin: 0 });

// right column — what we ask for
const asks = [
  ["รับรอง", "ความได้เปรียบเชิงยุทธศาสตร์ 6 มิติ"],
  ["เห็นชอบ", "นิยาม Outstanding ตาม Data Maturity (เป้าระดับ 4–5 ปี 2573)"],
  ["อนุมัติ", "เป้าหมายปลายทาง 5 เป้า พร้อม OKR/KPI ที่วัดได้"],
  ["สนับสนุน", "แผนดำเนินการ 2 ปี และข้อเสนอเชิงนโยบาย"],
];
let ay = 1.7;
s.addText("สาระสำคัญที่ขออนุมัติ", { x: 7.1, y: 1.7, w: 5.6, h: 0.35, fontFace: F, fontSize: 13, color: MUTED, bold: true, margin: 0 });
ay = 2.15;
asks.forEach((a) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.1, y: ay, w: 5.6, h: 1.0, fill: { color: WHITE }, line: { color: LINE, width: 1 }, rectRadius: 0.1, shadow: mkShadow() });
  s.addShape(pres.shapes.OVAL, { x: 7.32, y: ay + 0.26, w: 0.48, h: 0.48, fill: { color: TEAL } });
  s.addText("✓", { x: 7.32, y: ay + 0.26, w: 0.48, h: 0.48, fontFace: F, fontSize: 16, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText([
    { text: a[0] + "  ", options: { bold: true, color: TEAL } },
    { text: a[1], options: { color: TEXT } },
  ], { x: 8.0, y: ay + 0.12, w: 4.5, h: 0.76, fontFace: F, fontSize: 13, valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
  ay += 1.12;
});
pageNum(s, 2);

// ========================================================== SLIDE 3 — 6 ADVANTAGES
s = pres.addSlide();
header(s, "ความได้เปรียบเชิงยุทธศาสตร์", "6 มิติที่มหาวิทยาลัยได้เปรียบเมื่อมีศูนย์ฯ");
const adv = [
  ["01", "การตัดสินใจของผู้บริหาร", "Single Source of Truth + Dashboard ผู้บริหารแบบ near real-time"],
  ["02", "ประสิทธิภาพการดำเนินงาน", "ข้อมูลใช้ซ้ำได้ มีมาตรฐานกลาง ลดงานคีย์ซ้ำและ Shadow IT"],
  ["03", "ปฏิบัติตามกฎหมาย/PDPA", "มี DPO · RoPA · DPIA ลดความเสี่ยงปรับสูงสุด 5 ลบ."],
  ["04", "ยกอันดับ & คุณภาพ", "คลังข้อมูลตัวชี้วัดพร้อมตอบ THE/QS/EdPEx ทันเวลา"],
  ["05", "ความสามารถด้าน AI", "AI Ethics Framework + Analytics ที่ใช้ได้อย่างปลอดภัย"],
  ["06", "ภาพลักษณ์ & ความเชื่อมั่น", "องค์กร Responsible Data-Driven ที่น่าเชื่อถือ"],
];
const cols = 3, cw = 3.93, ch = 2.18, gx = 0.18, gy = 0.2, x0 = M, y0 = 1.68;
adv.forEach((a, i) => {
  const cx = x0 + (i % cols) * (cw + gx);
  const cy = y0 + Math.floor(i / cols) * (ch + gy);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: ch, fill: { color: i % 2 ? SOFT2 : SOFT }, line: { color: LINE, width: 1 }, rectRadius: 0.1, shadow: mkShadow() });
  s.addText(a[0], { x: cx + 0.22, y: cy + 0.18, w: 1.2, h: 0.6, fontFace: F, fontSize: 30, color: i % 2 ? AMBER : TEAL, bold: true, margin: 0 });
  s.addText(a[1], { x: cx + 0.22, y: cy + 0.78, w: cw - 0.44, h: 0.55, fontFace: F, fontSize: 14.5, color: TEXT, bold: true, valign: "top", margin: 0 });
  s.addText(a[2], { x: cx + 0.22, y: cy + 1.3, w: cw - 0.44, h: 0.78, fontFace: F, fontSize: 11.5, color: MUTED, valign: "top", lineSpacingMultiple: 1.05, margin: 0 });
});
pageNum(s, 3);

// ========================================================== SLIDE 4 — MATURITY LADDER
s = pres.addSlide();
header(s, "นิยามความเป็นเลิศ", "Outstanding = Data Maturity ระดับ 4–5 อย่างยั่งยืน");
const levels = [
  ["1", "Initial", "ทำเฉพาะกิจ"],
  ["2", "Managed", "นโยบายเริ่มต้น"],
  ["3", "Defined", "มาตรฐานทั่วองค์กร"],
  ["4", "Quantitative", "ตัดสินใจด้วยตัวเลข"],
  ["5", "Intelligent", "AI ปรับปรุงต่อเนื่อง"],
];
const bx0 = M, bw = 2.32, bgap = 0.2, baseY = 6.05, maxH = 3.4;
levels.forEach((lv, i) => {
  const h = 1.0 + (i / 4) * (maxH - 1.0);
  const bx = bx0 + i * (bw + bgap);
  const by = baseY - h;
  const isTarget = i >= 3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: h, fill: { color: isTarget ? TEAL : "DCE5E2" }, line: { type: "none" }, rectRadius: 0.06, shadow: isTarget ? mkShadow() : undefined });
  s.addText("ระดับ " + lv[0], { x: bx, y: by + 0.12, w: bw, h: 0.35, fontFace: F, fontSize: 14, color: isTarget ? WHITE : MUTED, bold: true, align: "center", margin: 0 });
  s.addText(lv[1], { x: bx, y: by + 0.46, w: bw, h: 0.32, fontFace: F, fontSize: 12.5, color: isTarget ? "CFE6DD" : TEXT, bold: true, align: "center", margin: 0 });
  s.addText(lv[2], { x: bx, y: baseY - 0.55, w: bw, h: 0.4, fontFace: F, fontSize: 10.5, color: isTarget ? "EAF3EF" : MUTED, align: "center", margin: 0 });
  s.addText(lv[0], { x: bx, y: baseY + 0.1, w: bw, h: 0.3, fontFace: F, fontSize: 11, color: MUTED, align: "center", margin: 0 });
});
// baseline
s.addShape(pres.shapes.LINE, { x: bx0, y: baseY, w: 5 * bw + 4 * bgap, h: 0, line: { color: MUTED, width: 1 } });
// markers
s.addText("● ปัจจุบัน ~1.8", { x: bx0 + 0.6, y: baseY + 0.5, w: 2.6, h: 0.35, fontFace: F, fontSize: 12, color: CORAL, bold: true, margin: 0 });
s.addText("เป้า 2 ปี ~3.1", { x: bx0 + 2 * (bw + bgap) + 0.2, y: baseY + 0.5, w: 2.6, h: 0.35, fontFace: F, fontSize: 12, color: TEAL, bold: true, margin: 0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx0 + 3 * (bw + bgap) - 0.1, y: 1.62, w: 2 * bw + bgap + 0.1, h: 0.5, fill: { color: TEALB, transparency: 82 }, line: { color: TEALB, width: 1 }, rectRadius: 0.06 });
s.addText("เป้าหมาย Outstanding ปี 2573", { x: bx0 + 3 * (bw + bgap) - 0.1, y: 1.62, w: 2 * bw + bgap + 0.1, h: 0.5, fontFace: F, fontSize: 12.5, color: TEAL, bold: true, align: "center", valign: "middle", margin: 0 });
pageNum(s, 4);

// ========================================================== SLIDE 5 — 5 GOALS + KPI
s = pres.addSlide();
header(s, "เป้าหมายปลายทาง", "5 เป้าหมายสู่ Outstanding พร้อมตัวชี้วัดที่วัดได้");
const goals = [
  ["ตัดสินใจด้วยข้อมูล", "Self-service Analytics +20%/ปี · SSOT ≥ 90%"],
  ["ข้อมูลมีคุณภาพ & พร้อมใช้", "Data Quality ≥ 90% · Metadata Coverage ≥ 80%"],
  ["ปฏิบัติตามกฎหมายเต็มรูปแบบ", "PDPA 100% ระบบเสี่ยงสูง · เหตุรั่วไหลร้ายแรง = 0"],
  ["บุคลากรมีขีดความสามารถ", "Data Literacy Coverage ≥ 60% ใน 2 ปี"],
  ["ใช้ AI อย่างรับผิดชอบ", "AI Ethics Review 100% · Use case AI ≥ 3"],
];
let gy2 = 1.72;
goals.forEach((g, i) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: gy2, w: 12.1, h: 0.92, fill: { color: WHITE }, line: { color: LINE, width: 1 }, rectRadius: 0.08, shadow: mkShadow() });
  s.addShape(pres.shapes.OVAL, { x: M + 0.22, y: gy2 + 0.21, w: 0.5, h: 0.5, fill: { color: TEAL } });
  s.addText(String(i + 1), { x: M + 0.22, y: gy2 + 0.21, w: 0.5, h: 0.5, fontFace: F, fontSize: 18, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(g[0], { x: M + 0.95, y: gy2, w: 4.6, h: 0.92, fontFace: F, fontSize: 15, color: TEXT, bold: true, valign: "middle", margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 5.7, y: gy2 + 0.22, w: 6.2, h: 0.48, fill: { color: SOFT }, line: { type: "none" }, rectRadius: 0.24 });
  s.addText(g[1], { x: M + 5.85, y: gy2 + 0.22, w: 5.95, h: 0.48, fontFace: F, fontSize: 11.5, color: TEAL, bold: true, valign: "middle", margin: 0 });
  gy2 += 1.04;
});
pageNum(s, 5);

// ========================================================== SLIDE 6 — RADAR
s = pres.addSlide();
header(s, "สถานะปัจจุบัน vs เป้าหมาย", "ประเมินวุฒิภาวะข้อมูล 8 ด้าน (สเกล 1–5)");
const radarLabels = ["D1 ธรรมาภิบาล", "D2 นโยบาย", "D3 บัญชีข้อมูล", "D4 คุณภาพ", "D5 PDPA", "D6 วิเคราะห์/AI", "D7 วัฒนธรรม", "D8 แพลตฟอร์ม"];
s.addChart(pres.charts.RADAR, [
  { name: "ปัจจุบัน (ประมาณการ)", labels: radarLabels, values: [2, 2, 1.5, 1, 2, 2, 1, 2.5] },
  { name: "เป้า 2 ปี", labels: radarLabels, values: [3, 3, 3, 3, 3.5, 3, 3, 3.5] },
], {
  x: 0.3, y: 1.6, w: 7.4, h: 5.4,
  chartColors: [CORAL, TEALB], chartColorsOpacity: [40, 30],
  radarStyle: "standard",
  showLegend: true, legendPos: "b", legendColor: TEXT, legendFontSize: 11, legendFontFace: F,
  catAxisLabelColor: TEXT, catAxisLabelFontSize: 10, catAxisLabelFontFace: F,
  valAxisMinVal: 0, valAxisMaxVal: 5, valAxisMajorUnit: 1,
  valAxisLabelColor: MUTED, valAxisLabelFontSize: 9,
  lineSize: 2,
});
// commentary
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.0, y: 1.85, w: 4.7, h: 1.5, fill: { color: SOFT }, line: { color: LINE, width: 1 }, rectRadius: 0.1 });
s.addText([
  { text: "ภาพรวม  ", options: { bold: true, color: TEAL } },
  { text: "อยู่ราวระดับ 1.5–2 (Initial → Managed) เป้า 2 ปีคือยกทุกด้านสู่ระดับ 3 (Defined)", options: { color: TEXT } },
], { x: 8.2, y: 2.0, w: 4.35, h: 1.25, fontFace: F, fontSize: 13, valign: "top", lineSpacingMultiple: 1.15, margin: 0 });
s.addText("จุดที่ต้องเร่งที่สุด", { x: 8.0, y: 3.55, w: 4.7, h: 0.35, fontFace: F, fontSize: 12, color: MUTED, bold: true, margin: 0 });
[["D4 คุณภาพข้อมูล", "ระดับ 1 → 3"], ["D7 วัฒนธรรมข้อมูล", "ระดับ 1 → 3"]].forEach((r, i) => {
  const ry = 3.95 + i * 0.92;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.0, y: ry, w: 4.7, h: 0.78, fill: { color: WHITE }, line: { color: CORAL, width: 1.2 }, rectRadius: 0.08 });
  s.addText(r[0], { x: 8.2, y: ry, w: 3.0, h: 0.78, fontFace: F, fontSize: 13.5, color: TEXT, bold: true, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 11.0, y: ry, w: 1.55, h: 0.78, fontFace: F, fontSize: 12, color: CORAL, bold: true, align: "right", valign: "middle", margin: 0 });
});
s.addText("* ค่าปัจจุบันเป็นประมาณการ ต้องยืนยันด้วยการสำรวจจริงในไตรมาสแรก", { x: 8.0, y: 5.75, w: 4.7, h: 0.5, fontFace: F, fontSize: 10, color: MUTED, italic: true, valign: "top", margin: 0 });
pageNum(s, 6);

// ========================================================== SLIDE 7 — GAP ANALYSIS
s = pres.addSlide();
header(s, "การวิเคราะห์ช่องว่าง", "จัดลำดับสิ่งที่ต้องเร่งดำเนินการ");
const gaps = [
  ["สูง", CORAL, "D4 คุณภาพข้อมูล (1→3)", "ตัดสินใจบนข้อมูลผิด เสียความน่าเชื่อถือ", "มาตรฐานคุณภาพ + วัด Data Quality Score"],
  ["สูง", CORAL, "D7 วัฒนธรรม/Literacy (1→3)", "ลงทุนเครื่องมือแต่คนใช้ไม่เป็น", "โปรแกรม Data Literacy ทั่วองค์กร"],
  ["กลาง", AMBER, "D3 บัญชีข้อมูล (1–2→3)", "หาข้อมูลไม่เจอ ซ้ำซ้อน", "Data Inventory + Catalog (OpenMetadata)"],
  ["กลาง", AMBER, "D5 PDPA (2→3–4)", "เสี่ยงปรับ 5 ลบ. + ชื่อเสียง", "DPIA ระบบเสี่ยงสูงครบ 100%"],
  ["ต่อยอด", TEAL, "D1·D2·D6·D8 (→3)", "ของเริ่มมีแล้ว ต้องทำให้ครบ", "ใช้ Council/นโยบาย/Dashboard จริง"],
];
// header row
const colX = [M, M + 1.3, M + 4.4, M + 8.0];
const colW = [1.2, 3.0, 3.5, 4.0];
const hdrs = ["ลำดับ", "ช่องว่าง", "ความเสี่ยงหากไม่ทำ", "งานหลักที่ต้องปิดช่องว่าง"];
let ry = 1.78;
hdrs.forEach((h, i) => s.addText(h, { x: colX[i], y: ry, w: colW[i], h: 0.35, fontFace: F, fontSize: 12, color: MUTED, bold: true, margin: 0 }));
ry += 0.45;
gaps.forEach((g) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ry, w: 12.1, h: 0.86, fill: { color: WHITE }, line: { color: LINE, width: 1 }, rectRadius: 0.08, shadow: mkShadow() });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: colX[0] + 0.05, y: ry + 0.25, w: 1.0, h: 0.36, fill: { color: g[1] }, line: { type: "none" }, rectRadius: 0.18 });
  s.addText(g[0], { x: colX[0] + 0.05, y: ry + 0.25, w: 1.0, h: 0.36, fontFace: F, fontSize: 11, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(g[2], { x: colX[1], y: ry, w: colW[1], h: 0.86, fontFace: F, fontSize: 12.5, color: TEXT, bold: true, valign: "middle", margin: 0 });
  s.addText(g[3], { x: colX[2], y: ry, w: colW[2], h: 0.86, fontFace: F, fontSize: 11.5, color: MUTED, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
  s.addText(g[4], { x: colX[3], y: ry, w: colW[3], h: 0.86, fontFace: F, fontSize: 11.5, color: TEAL, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
  ry += 0.96;
});
pageNum(s, 7);

// ========================================================== SLIDE 8 & 9 — PLAN
function planSlide(title, kicker, year, quarters, n) {
  const sl = pres.addSlide();
  header(sl, kicker, title);
  const qw = 2.94, qgap = 0.13, qy = 1.85, qh = 4.55;
  quarters.forEach((q, i) => {
    const qx = M + i * (qw + qgap);
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: qx, y: qy, w: qw, h: qh, fill: { color: i % 2 ? SOFT2 : SOFT }, line: { color: LINE, width: 1 }, rectRadius: 0.1, shadow: mkShadow() });
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: qx, y: qy, w: qw, h: 0.72, fill: { color: year === 1 ? TEAL : AMBER }, line: { type: "none" }, rectRadius: 0.1 });
    sl.addShape(pres.shapes.RECTANGLE, { x: qx, y: qy + 0.4, w: qw, h: 0.32, fill: { color: year === 1 ? TEAL : AMBER }, line: { type: "none" } });
    sl.addText(q.q, { x: qx + 0.18, y: qy + 0.06, w: qw - 0.36, h: 0.32, fontFace: F, fontSize: 15, color: WHITE, bold: true, margin: 0 });
    sl.addText(q.t, { x: qx + 0.18, y: qy + 0.38, w: qw - 0.36, h: 0.3, fontFace: F, fontSize: 10.5, color: "EAF3EF", margin: 0 });
    sl.addText(q.tasks.map((t, j) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: true, paraSpaceAfter: 6 } })),
      { x: qx + 0.2, y: qy + 0.9, w: qw - 0.4, h: 2.7, fontFace: F, fontSize: 11, color: TEXT, valign: "top", lineSpacingMultiple: 1.02, margin: 0 });
    sl.addShape(pres.shapes.LINE, { x: qx + 0.2, y: qy + qh - 0.95, w: qw - 0.4, h: 0, line: { color: LINE, width: 1 } });
    sl.addText("ตัววัด", { x: qx + 0.2, y: qy + qh - 0.88, w: qw - 0.4, h: 0.25, fontFace: F, fontSize: 9.5, color: MUTED, bold: true, margin: 0 });
    sl.addText(q.kpi, { x: qx + 0.2, y: qy + qh - 0.63, w: qw - 0.4, h: 0.55, fontFace: F, fontSize: 10, color: year === 1 ? TEAL : AMBER, bold: true, valign: "top", lineSpacingMultiple: 1.0, margin: 0 });
  });
  pageNum(sl, n);
  return sl;
}

planSlide("แผนปฏิบัติการ ปีที่ 1 — วางรากฐาน & สร้างมาตรฐาน", "แผน 2 ปี (ก.ค. 2569 – มิ.ย. 2570)", 1, [
  { q: "Q1", t: "ก.ค.–ก.ย. 69", tasks: ["ทำ Maturity Assessment จริง", "แต่งตั้ง CDO + ตั้ง Council", "แต่งตั้ง Steward นำร่อง 3–5 หน่วยงาน"], kpi: "Council ประชุมครั้งแรก · Steward ครบ" },
  { q: "Q2", t: "ต.ค.–ธ.ค. 69", tasks: ["ประกาศนโยบายธรรมาภิบาล", "จำแนกชั้นความลับฉบับแรก", "เริ่มทำ Data Inventory (T01)"], kpi: "นโยบายบังคับใช้ · Inventory นำร่องเสร็จ" },
  { q: "Q3", t: "ม.ค.–มี.ค. 70", tasks: ["จัดทำ RoPA + DPIA ระบบเสี่ยงสูง", "กำหนดมาตรฐานคุณภาพข้อมูล", "ตั้งเกณฑ์ยอมรับคุณภาพ"], kpi: "DPIA เริ่มครบ · มาตรฐานคุณภาพประกาศ" },
  { q: "Q4", t: "เม.ย.–มิ.ย. 70", tasks: ["เปิดใช้ Data Catalog (OpenMetadata)", "เริ่มวัด KPI ชุดแรก", "Data Quality Score · Metadata Coverage"], kpi: "Catalog ใช้จริง · KPI Dashboard เริ่มเดิน" },
], 8);

planSlide("แผนปฏิบัติการ ปีที่ 2 — ใช้จริงทั่วองค์กร & ยกระดับ", "แผน 2 ปี (ก.ค. 2570 – มิ.ย. 2571)", 2, [
  { q: "Q5", t: "ก.ค.–ก.ย. 70", tasks: ["ขับเคลื่อน Data Literacy ทั่วองค์กร", "ขยาย Inventory/Catalog ทุกหน่วยงานหลัก"], kpi: "อบรมรุ่นแรก · Metadata Coverage เพิ่มขึ้น" },
  { q: "Q6", t: "ต.ค.–ธ.ค. 70", tasks: ["Dashboard ผู้บริหารใช้จริงในการประชุม", "ยกคุณภาพข้อมูลชุดสำคัญสู่ ≥ 90%"], kpi: "ผู้บริหารใช้ Dashboard · DQ Score ≥ 90%" },
  { q: "Q7", t: "ม.ค.–มี.ค. 71", tasks: ["DPIA ครบ 100% ระบบเสี่ยงสูง", "เริ่ม Advanced Analytics", "เปิดเวที AI Ethics Review"], kpi: "PDPA 100% · AI Review เริ่มใช้" },
  { q: "Q8", t: "เม.ย.–มิ.ย. 71", tasks: ["ประเมิน Maturity ซ้ำเทียบเป้า", "Data Literacy Coverage ≥ 60%", "ทบทวนแผนสู่ปี 2573"], kpi: "ค่าเฉลี่ย Maturity ≥ 3 · Literacy ≥ 60%" },
], 9);

// ========================================================== SLIDE 10 — POLICY ASKS
s = pres.addSlide();
header(s, "ข้อเสนอเชิงนโยบาย", "สิ่งที่ขอให้ผู้บริหารและสภามหาวิทยาลัยพิจารณา");
const policy = [
  "อนุมัติเชิงหลักการให้จัดตั้ง/ยกระดับศูนย์ฯ เป็นหน่วยงานระดับองค์กรที่รายงานตรงต่อผู้บริหารสูงสุด",
  "แต่งตั้ง CDO และ Data Governance Council ให้มีอำนาจกำกับข้ามหน่วยงาน",
  "สนับสนุนงบประมาณบุคลากรหลัก แพลตฟอร์มข้อมูล และโปรแกรม Data Literacy ตามระยะใน Roadmap",
  "กำหนดให้รายงาน KPI ต่อสภามหาวิทยาลัยอย่างน้อยปีละ 2 ครั้ง",
  "บรรจุเป้าหมายข้อมูลเป็นส่วนหนึ่งของแผนยุทธศาสตร์และการประกันคุณภาพ (EdPEx/AUN-QA)",
];
let py = 1.78;
policy.forEach((p, i) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: py, w: 12.1, h: 0.92, fill: { color: i % 2 ? SOFT2 : SOFT }, line: { color: LINE, width: 1 }, rectRadius: 0.08 });
  s.addShape(pres.shapes.OVAL, { x: M + 0.24, y: py + 0.21, w: 0.5, h: 0.5, fill: { color: i % 2 ? AMBER : TEAL } });
  s.addText(String(i + 1), { x: M + 0.24, y: py + 0.21, w: 0.5, h: 0.5, fontFace: F, fontSize: 18, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(p, { x: M + 0.98, y: py, w: 11.0, h: 0.92, fontFace: F, fontSize: 14, color: TEXT, valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
  py += 1.04;
});
pageNum(s, 10);

// ========================================================== SLIDE 11 — CLOSING
s = pres.addSlide();
s.background = { color: DARK };
s.addShape(pres.shapes.OVAL, { x: -1.5, y: 4.6, w: 4.6, h: 4.6, line: { color: TEALB, width: 1.5, transparency: 55 }, fill: { type: "none" } });
s.addShape(pres.shapes.OVAL, { x: -0.7, y: 5.4, w: 3.0, h: 3.0, fill: { color: TEALB, transparency: 82 }, line: { type: "none" } });
s.addText("สรุปสำหรับผู้บริหาร", { x: M, y: 1.5, w: 11, h: 0.4, fontFace: F, fontSize: 14, color: TEALB, bold: true, charSpacing: 2, margin: 0 });
s.addText([
  { text: "วันนี้อยู่ราวระดับ 1.5–2 ", options: { color: WHITE } },
  { text: "→ ", options: { color: TEALB } },
  { text: "แผน 2 ปียกทุกด้านสู่ระดับ 3 ", options: { color: WHITE } },
  { text: "→ ", options: { color: TEALB } },
  { text: "Outstanding ระดับ 4–5 ในปี 2573", options: { color: TEALB } },
], { x: M, y: 2.0, w: 11.8, h: 1.4, fontFace: F, fontSize: 28, bold: true, lineSpacingMultiple: 1.2, valign: "top", margin: 0 });
s.addShape(pres.shapes.LINE, { x: M, y: 3.7, w: 2.2, h: 0, line: { color: TEALB, width: 2.5 } });
s.addText("ขั้นถัดไป (Quick Win 3 อย่างแรก)", { x: M, y: 4.0, w: 11, h: 0.4, fontFace: F, fontSize: 14, color: "AFC6BE", bold: true, margin: 0 });
const qw3 = ["ทำ Maturity Assessment จริง", "ตั้ง Council + แต่งตั้ง Steward นำร่อง", "ประกาศนโยบายธรรมาภิบาลข้อมูลฉบับแรก"];
qw3.forEach((t, i) => {
  const qx = M + i * 4.0;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: qx, y: 4.5, w: 3.8, h: 1.2, fill: { color: "16384A" }, line: { color: TEALB, width: 1, transparency: 40 }, rectRadius: 0.1 });
  s.addText(String(i + 1), { x: qx + 0.2, y: 4.62, w: 0.6, h: 0.5, fontFace: F, fontSize: 22, color: TEALB, bold: true, margin: 0 });
  s.addText(t, { x: qx + 0.2, y: 5.05, w: 3.4, h: 0.6, fontFace: F, fontSize: 12.5, color: WHITE, valign: "top", lineSpacingMultiple: 1.05, margin: 0 });
});
s.addText("ศูนย์ธรรมาภิบาลข้อมูลและยุทธศาสตร์อัจฉริยะ (DGSI) · มิถุนายน 2569", { x: M, y: 6.7, w: 11, h: 0.4, fontFace: F, fontSize: 12, color: "7E9A91", margin: 0 });

pres.writeFile({ fileName: "ข้อเสนอเชิงยุทธศาสตร์ DGSI (สไลด์ผู้บริหาร).pptx" }).then((f) => console.log("WROTE", f));
