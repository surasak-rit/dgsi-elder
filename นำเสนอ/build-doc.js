const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, TableOfContents, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, Header, Footer,
} = require("docx");

const FONT = "TH Sarabun New";
const TEAL = "0F6E56";
const TEALD = "0E2A3B";
const CORAL = "B5471F";
const AMBER = "8A5A0B";
const HEADFILL = "0F6E56";
const ZEBRA = "EAF3EF";
const ZEBRA2 = "F4F1EA";
const TEXT = "1A2B33";
const MUTED = "5F6B70";
const CW = 9026; // A4 content width @1" margins

const bd = { style: BorderStyle.SINGLE, size: 4, color: "C9D6D1" };
const borders = { top: bd, bottom: bd, left: bd, right: bd, insideHorizontal: bd, insideVertical: bd };
const cellMargins = { top: 60, bottom: 60, left: 110, right: 110 };

function run(text, opts = {}) { return new TextRun({ text, font: FONT, ...opts }); }
function p(text, opts = {}) {
  const { runs, ...para } = opts;
  return new Paragraph({ children: runs || [run(text, opts.runOpts || {})], ...para });
}
function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(text, { bold: true, color: TEAL, size: 36 })], spacing: { before: 280, after: 140 } }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(text, { bold: true, color: TEALD, size: 30 })], spacing: { before: 200, after: 100 } }); }
function body(text, opts = {}) { return new Paragraph({ children: [run(text, { size: 30, color: TEXT, ...opts })], spacing: { after: 100, line: 300 }, alignment: AlignmentType.JUSTIFIED }); }
function bullet(runs, ref = "bullets") { return new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs, spacing: { after: 60, line: 290 } }); }

function headerCell(text, w) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, margins: cellMargins, shading: { fill: HEADFILL, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [run(text, { bold: true, color: "FFFFFF", size: 28 })] })] });
}
function cell(content, w, opts = {}) {
  const runsArr = Array.isArray(content) ? content : [run(content, { size: 28, color: TEXT, ...(opts.runOpts || {}) })];
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.CENTER,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: runsArr })] });
}
function table(widths, headerTexts, rows, opts = {}) {
  const headRow = new TableRow({ tableHeader: true, children: headerTexts.map((t, i) => headerCell(t, widths[i])) });
  const bodyRows = rows.map((r, ri) => new TableRow({ children: r.map((c, ci) => {
    const fill = ci === 0 ? undefined : (ri % 2 ? ZEBRA2 : ZEBRA);
    if (c && typeof c === "object" && c.runs) return cell(c.runs, widths[ci], { fill: c.fill || fill, align: c.align });
    return cell(c, widths[ci], { fill, align: opts.aligns ? opts.aligns[ci] : undefined });
  }) }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [headRow, ...bodyRows] });
}
function spacer(h = 80) { return new Paragraph({ children: [], spacing: { after: h } }); }

// =================== content ===================
const children = [];

// ---- title page ----
children.push(new Paragraph({ children: [run("เอกสารเสนอผู้บริหารระดับสูง", { bold: true, color: TEAL, size: 30 })], alignment: AlignmentType.CENTER, spacing: { before: 1800, after: 120 } }));
children.push(new Paragraph({ children: [run("ศูนย์ธรรมาภิบาลข้อมูลและยุทธศาสตร์อัจฉริยะ", { bold: true, color: TEALD, size: 56 })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }));
children.push(new Paragraph({ children: [run("(Data Governance & Intelligent Strategy Center — DGSI)", { color: MUTED, size: 30 })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
children.push(new Paragraph({ children: [run("ความได้เปรียบเชิงยุทธศาสตร์ การประเมินสถานะปัจจุบัน", { color: TEAL, size: 36, bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 40 } }));
children.push(new Paragraph({ children: [run("และแผนดำเนินการสู่ความเป็นเลิศ (Outstanding) ใน 2 ปี", { color: TEAL, size: 36, bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 1600 } }));
children.push(new Paragraph({ children: [run("เสนอต่อ  อธิการบดี · รองอธิการบดี · สภามหาวิทยาลัย", { color: TEXT, size: 30 })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }));
children.push(new Paragraph({ children: [run("มิถุนายน 2569", { color: MUTED, size: 30 })], alignment: AlignmentType.CENTER }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- TOC ----
children.push(new Paragraph({ children: [run("สารบัญ", { bold: true, color: TEAL, size: 36 })], spacing: { after: 160 } }));
children.push(new TableOfContents("สารบัญ", { hyperlink: true, headingStyleRange: "1-1" }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 1 exec summary ----
children.push(h1("1. บทสรุปผู้บริหาร"));
children.push(body("มหาวิทยาลัยกำลังเข้าสู่ยุคที่ข้อมูลคือสินทรัพย์เชิงยุทธศาสตร์ ไม่ต่างจากบุคลากรหรืองบประมาณ การจัดตั้งศูนย์ธรรมาภิบาลข้อมูลและยุทธศาสตร์อัจฉริยะ (DGSI) จึงมิใช่เพียงงานด้านเทคโนโลยีสารสนเทศ แต่เป็นการวางกลไกกำกับระดับองค์กรที่เปลี่ยนวิธีการตัดสินใจจาก ‘ประสบการณ์และสัญชาตญาณ’ สู่ ‘หลักฐานเชิงข้อมูลที่ตรวจสอบได้’"));
children.push(p("", { runs: [run("สาระสำคัญที่ขออนุมัติ", { bold: true, color: TEALD, size: 30 })], spacing: { before: 120, after: 80 } }));
children.push(bullet([run("รับรองความได้เปรียบเชิงยุทธศาสตร์ 6 มิติของการมีศูนย์ฯ (หัวข้อ 2)", { size: 30 })]));
children.push(bullet([run("เห็นชอบนิยามความเป็น Outstanding ตาม Data Maturity Model โดยตั้งเป้าสู่ระดับ 4–5 ภายในปี 2573 (หัวข้อ 3)", { size: 30 })]));
children.push(bullet([run("อนุมัติชุดเป้าหมายปลายทาง 5 เป้า พร้อม OKR/KPI ที่วัดได้ (หัวข้อ 4)", { size: 30 })]));
children.push(bullet([run("สนับสนุนแผนดำเนินการ 2 ปี และข้อเสนอเชิงนโยบาย (หัวข้อ 6–8)", { size: 30 })]));
children.push(spacer(60));
children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({ children: [
  new TableCell({ borders, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, shading: { fill: ZEBRA, type: ShadingType.CLEAR }, children: [
    new Paragraph({ children: [run("ใจความหลัก: ", { bold: true, color: TEAL, size: 30 }), run("ศูนย์ฯ นี้คือการลงทุนที่เปลี่ยนความเสี่ยงด้านข้อมูล (PDPA · ข้อมูลรั่วไหล · การตัดสินใจผิดพลาด) ให้กลายเป็นความได้เปรียบในการแข่งขัน (อันดับมหาวิทยาลัย · ประสิทธิภาพ · ความเชื่อมั่น)", { size: 30, color: TEXT })], spacing: { line: 300 } }),
  ] })
] })] }));

// ---- 2 advantages ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("2. ความได้เปรียบเชิงยุทธศาสตร์ (Strategic Advantages)"));
children.push(body("มหาวิทยาลัยที่มีศูนย์ฯ ได้เปรียบมหาวิทยาลัยที่ไม่มีอย่างเป็นรูปธรรมใน 6 มิติ:"));
children.push(table([2000, 2400, 2400, 2226], ["มิติ", "ไม่มีศูนย์ฯ", "มีศูนย์ฯ", "ผลลัพธ์ที่จับต้องได้"], [
  ["การตัดสินใจของผู้บริหาร", "ข้อมูลกระจัดกระจาย ตัวเลขขัดแย้ง ตัดสินใจช้า", "Single Source of Truth + Dashboard near real-time", "ตัดสินใจเร็วบนข้อมูลชุดเดียวที่เชื่อถือได้"],
  ["ประสิทธิภาพการดำเนินงาน", "งานซ้ำซ้อน เก็บข้อมูลซ้ำ (Shadow IT)", "ข้อมูลใช้ซ้ำได้ มีมาตรฐานกลาง", "ลดต้นทุนเวลา/แรงงานในการรวบรวมข้อมูล"],
  ["ปฏิบัติตามกฎหมาย/ธรรมาภิบาล", "เสี่ยงละเมิด PDPA ไม่มีผู้รับผิดชอบ", "มี DPO · RoPA · DPIA · จำแนกชั้นความลับ", "ลดความเสี่ยงทางกฎหมายและชื่อเสียง"],
  ["ยกอันดับและคุณภาพ (QA)", "ตอบ THE/QS/EdPEx แบบตั้งรับ", "คลังข้อมูลตัวชี้วัดพร้อมใช้ ตรวจย้อนได้", "ตอบตัวชี้วัดแม่นยำ ทันเวลา หนุนอันดับ"],
  ["ความสามารถด้าน AI/Analytics", "ใช้ AI กระจัดกระจาย เสี่ยงอคติ", "AI Ethics Framework + Advanced Analytics", "ใช้ AI สร้างคุณค่าอย่างปลอดภัยและอธิบายได้"],
  ["ภาพลักษณ์และความเชื่อมั่น", "ผู้มีส่วนได้ส่วนเสียกังวลความเป็นส่วนตัว", "องค์กร Responsible Data-Driven ที่น่าเชื่อถือ", "เพิ่มความเชื่อมั่นของทุกฝ่าย"],
]));

// ---- 3 maturity ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("3. นิยามความเป็น Outstanding (Data Maturity Model)"));
children.push(body("เพื่อให้ ‘ความเป็นเลิศ’ วัดได้และไม่เป็นนามธรรม ใช้กรอบ Data Maturity Model 5 ระดับ (สังเคราะห์จาก DAMA-DMBOK, DGI และ Gartner) เป็นบันไดวัดความก้าวหน้า:"));
children.push(table([1100, 2400, 3100, 2426], ["ระดับ", "ชื่อระดับ", "ลักษณะสำคัญ", "สถานะที่คาด"], [
  [{ runs: [run("1", { size: 28, bold: true })], align: AlignmentType.CENTER }, "Initial / Ad-hoc", "ไม่มีนโยบายกลาง ข้อมูลแยกส่วน", "จุดเริ่มต้นก่อนมีศูนย์ฯ"],
  [{ runs: [run("2", { size: 28, bold: true })], align: AlignmentType.CENTER }, "Managed / Reactive", "มีนโยบายเริ่มต้น แก้ปัญหาเฉพาะหน้า", "เป้าระยะที่ 1 (Quick Win)"],
  [{ runs: [run("3", { size: 28, bold: true })], align: AlignmentType.CENTER }, "Defined / Proactive", "มาตรฐานกลาง Catalog และ KPI ทั่วองค์กร", "เป้าระยะที่ 2 (Build)"],
  [{ runs: [run("4", { size: 28, bold: true, color: TEAL })], align: AlignmentType.CENTER }, { runs: [run("Quantitatively Managed", { size: 28, bold: true, color: TEAL })] }, "ตัดสินใจด้วยข้อมูลเชิงปริมาณ Analytics เป็นปกติ", { runs: [run("เป้า Outstanding ขั้นต้น", { size: 28, bold: true, color: TEAL })] }],
  [{ runs: [run("5", { size: 28, bold: true, color: TEAL })], align: AlignmentType.CENTER }, { runs: [run("Optimizing / Intelligent", { size: 28, bold: true, color: TEAL })] }, "ใช้ AI/Predictive อย่างรับผิดชอบ ปรับปรุงต่อเนื่อง", { runs: [run("เป้า Outstanding สูงสุด ปี 2573", { size: 28, bold: true, color: TEAL })] }],
]));
children.push(spacer(60));
children.push(body("นิยาม Outstanding ของมหาวิทยาลัย = บรรลุ Data Maturity ระดับ 4–5 อย่างยั่งยืน ควบคู่กับการเป็น Responsible Data-Driven University ที่ใช้ข้อมูลและ AI อย่างชาญฉลาดและรับผิดชอบทั่วทั้งการเรียนการสอน วิจัย บริการวิชาการ และการบริหาร"));

// ---- 4 goals ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("4. ชุดเป้าหมายปลายทางและตัวชี้วัด (Outstanding Goals & KPI)"));
const goals = [
  ["1. ตัดสินใจด้วยข้อมูล (Data-Driven)", "Self-service Analytics Adoption เพิ่ม 20%/ปี · Single Source of Truth ครอบคลุมข้อมูลสำคัญ ≥ 90%", "เริ่มวัดระยะที่ 2 บรรลุปี 2572–2573"],
  ["2. ข้อมูลมีคุณภาพและพร้อมใช้ (Trusted Data)", "Data Quality Score ≥ 90% (baseline ~60–70%) · Metadata Coverage ≥ 80% ใน 18 เดือน", "บรรลุภายในสิ้นระยะที่ 2"],
  ["3. ปฏิบัติตามกฎหมายเต็มรูปแบบ (Compliance)", "PDPA Compliance 100% ของระบบเสี่ยงสูง · เหตุข้อมูลรั่วไหลร้ายแรง = 0 และลดลง YoY", "ขั้นพื้นฐานระยะที่ 1 เต็มรูปแบบระยะที่ 2"],
  ["4. บุคลากรมีขีดความสามารถ (Data Literacy)", "Data Literacy Coverage ≥ 60% ภายใน 2 ปี (baseline < 10%)", "ขับเคลื่อนต่อเนื่องระยะที่ 2–3"],
  ["5. ใช้ AI อย่างรับผิดชอบ (Responsible Intelligence)", "AI Ethics Review Rate 100% · บริการ Advanced Analytics/AI ใช้จริง ≥ 3 use case", "เริ่มระยะที่ 3 ยกสู่ Maturity ระดับ 5"],
];
children.push(table([3000, 4200, 1826], ["เป้าหมาย", "OKR / KPI", "กรอบเวลา"], goals.map(g => [
  { runs: [run(g[0], { size: 28, bold: true, color: TEALD })] }, g[1], g[2],
])));

// ---- 5 assessment ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("5. การประเมินสถานะปัจจุบัน (Data Maturity Assessment)"));
children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({ children: [
  new TableCell({ borders, width: { size: CW, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, shading: { fill: "FBEEDA", type: ShadingType.CLEAR }, children: [
    new Paragraph({ children: [run("ข้อควรทราบ: ", { bold: true, color: AMBER, size: 30 }), run("ค่าประเมิน ‘สถานะปัจจุบัน’ เป็นค่าประมาณการเบื้องต้นที่อนุมานจากเอกสารชุด DGSI ยังไม่ใช่ผลสำรวจจริง ขั้นแรกของแผนคือให้แต่ละฝ่าย/Steward กรอกแบบประเมินเพื่อยืนยันค่าจริงก่อนผูกเป็นเป้าหมาย", { size: 30, color: TEXT })], spacing: { line: 300 } }),
  ] })
] })] }));
children.push(spacer(80));
children.push(h2("5.1 ผลประเมินเบื้องต้นรายด้าน (สเกล 1–5)"));
children.push(table([2500, 2700, 1150, 1150, 1526], ["ด้าน", "ฝ่ายเจ้าภาพ", "ปัจจุบัน*", "เป้า 2 ปี", "ช่องว่าง"], [
  ["D1 ธรรมาภิบาล & องค์กร", "CDO / Council", "2", "3", "1"],
  ["D2 นโยบาย & มาตรฐาน", "Policy & Standards", "2", "3", "1"],
  ["D3 บัญชีข้อมูล & Metadata", "Data Quality & Architecture", "1–2", "3", "1–2"],
  [{ runs: [run("D4 คุณภาพข้อมูล", { size: 28, bold: true, color: CORAL })] }, "Data Quality & Architecture", { runs: [run("1", { size: 28, bold: true, color: CORAL })] }, "3", { runs: [run("2", { size: 28, bold: true, color: CORAL })] }],
  ["D5 ความมั่นคง & PDPA", "Security & Privacy / DPO", "2", "3–4", "1–2"],
  ["D6 การวิเคราะห์ & AI", "Analytics & AI", "2", "3", "1"],
  [{ runs: [run("D7 วัฒนธรรม & ขีดความสามารถ", { size: 28, bold: true, color: CORAL })] }, "Data Literacy & Enablement", { runs: [run("1", { size: 28, bold: true, color: CORAL })] }, "3", { runs: [run("2", { size: 28, bold: true, color: CORAL })] }],
  ["D8 แพลตฟอร์ม & บูรณาการ", "Data Quality & Architecture", "2–3", "3–4", "1"],
  [{ runs: [run("ค่าเฉลี่ยรวม", { size: 28, bold: true })] }, { runs: [run("—", { size: 28 })] }, { runs: [run("~1.8", { size: 28, bold: true })] }, { runs: [run("~3.1", { size: 28, bold: true, color: TEAL })] }, { runs: [run("~1.3", { size: 28, bold: true })] }],
], { aligns: [undefined, undefined, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER] }));
children.push(new Paragraph({ children: [run("* ค่าประมาณการ อนุมานจากเอกสาร DGSI ปัจจุบัน (Charter อนุมัติแล้ว = D1 เริ่มมี, Data Platform เริ่มแล้ว = D8 นำหน้า, Data Quality/Literacy ยังไม่เริ่ม = ระดับ 1)", { size: 26, italic: true, color: MUTED })], spacing: { before: 60, after: 120 } }));
children.push(body("ภาพรวม: มหาวิทยาลัยน่าจะอยู่ราวระดับ 1.5–2 (Initial → Managed) จุดแข็งคือโครงสร้างและแพลตฟอร์มที่เริ่มวางแล้ว (D1, D8) จุดที่ต้องเร่งคือคุณภาพข้อมูล (D4) และวัฒนธรรมข้อมูล (D7) ซึ่งยังอยู่ระดับ 1 — เป้าหมาย 2 ปีคือยกทุกด้านสู่ระดับ 3 (Defined) อย่างทั่วถึง เป็นฐานสู่ระดับ 4–5 ในปี 2573"));

// ---- 6 gap ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("6. การวิเคราะห์ช่องว่าง (Gap Analysis)"));
children.push(table([1300, 2600, 2600, 2526], ["ลำดับ", "ช่องว่างที่ใหญ่ที่สุด", "ความเสี่ยงหากไม่ทำ", "งานหลักที่ต้องปิดช่องว่าง"], [
  [{ runs: [run("สูง", { size: 28, bold: true, color: CORAL })], align: AlignmentType.CENTER }, "D4 คุณภาพข้อมูล (1→3)", "ตัดสินใจบนข้อมูลผิด เสียความน่าเชื่อถือ", "มาตรฐานคุณภาพ + วัด Data Quality Score"],
  [{ runs: [run("สูง", { size: 28, bold: true, color: CORAL })], align: AlignmentType.CENTER }, "D7 วัฒนธรรม/Literacy (1→3)", "ลงทุนเครื่องมือแต่คนใช้ไม่เป็น", "โปรแกรม Data Literacy ทั่วองค์กร"],
  [{ runs: [run("กลาง", { size: 28, bold: true, color: AMBER })], align: AlignmentType.CENTER }, "D3 บัญชีข้อมูล (1–2→3)", "หาข้อมูลไม่เจอ ซ้ำซ้อน", "Data Inventory + Catalog (OpenMetadata)"],
  [{ runs: [run("กลาง", { size: 28, bold: true, color: AMBER })], align: AlignmentType.CENTER }, "D5 PDPA (2→3–4)", "เสี่ยงปรับ 5 ลบ. + ชื่อเสียง", "DPIA ระบบเสี่ยงสูงครบ 100%"],
  [{ runs: [run("ต่อยอด", { size: 28, bold: true, color: TEAL })], align: AlignmentType.CENTER }, "D1·D2·D6·D8 (→3)", "ของเริ่มมีแล้ว ต้องทำให้ครบและสม่ำเสมอ", "ใช้ Council/นโยบาย/Dashboard จริงทั่วองค์กร"],
]));

// ---- 7 plan ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("7. แผนปฏิบัติการ 2 ปี รายไตรมาส"));
children.push(h2("7.1 ปีที่ 1 (ก.ค. 2569 – มิ.ย. 2570) — วางรากฐาน & สร้างมาตรฐาน"));
children.push(table([1300, 3900, 2300, 1526], ["ไตรมาส", "งานหลัก", "เจ้าภาพ", "ปิดช่องว่าง"], [
  [{ runs: [run("Q1", { size: 28, bold: true })] }, "ทำ Maturity Assessment จริง · แต่งตั้ง CDO + ตั้ง Council · Steward นำร่อง 3–5 หน่วยงาน", "CDO / Council", "D1"],
  [{ runs: [run("Q2", { size: 28, bold: true })] }, "ประกาศนโยบายธรรมาภิบาล + จำแนกชั้นความลับ · เริ่ม Data Inventory (T01)", "Policy & Standards", "D2, D3"],
  [{ runs: [run("Q3", { size: 28, bold: true })] }, "จัดทำ RoPA + DPIA ระบบเสี่ยงสูง · กำหนดมาตรฐานคุณภาพข้อมูล", "DPO / Data Quality", "D5, D4"],
  [{ runs: [run("Q4", { size: 28, bold: true })] }, "เปิดใช้ Data Catalog (OpenMetadata) · เริ่มวัด KPI ชุดแรก", "Data Quality & Architecture", "D3, D4"],
]));
children.push(new Paragraph({ children: [run("เป้าสิ้นปีที่ 1: ", { bold: true, color: TEAL, size: 28 }), run("ทุกด้านขึ้นถึงระดับ 2–3 · มีนโยบาย/มาตรฐาน/Catalog ใช้จริง · เริ่มมีตัวเลขวัดผล", { size: 28, color: TEXT })], spacing: { before: 80, after: 160 } }));
children.push(h2("7.2 ปีที่ 2 (ก.ค. 2570 – มิ.ย. 2571) — ใช้จริงทั่วองค์กร & ยกระดับ"));
children.push(table([1300, 3900, 2300, 1526], ["ไตรมาส", "งานหลัก", "เจ้าภาพ", "ปิดช่องว่าง"], [
  [{ runs: [run("Q5", { size: 28, bold: true })] }, "ขับเคลื่อน Data Literacy ทั่วองค์กร · ขยาย Inventory/Catalog ทุกหน่วยงานหลัก", "Data Literacy / Architecture", "D7, D3"],
  [{ runs: [run("Q6", { size: 28, bold: true })] }, "Dashboard ผู้บริหารใช้จริงในการประชุม · ยกคุณภาพข้อมูลสู่ DQ Score ≥ 90%", "Analytics & AI / Data Quality", "D6, D4"],
  [{ runs: [run("Q7", { size: 28, bold: true })] }, "DPIA ครบ 100% ระบบเสี่ยงสูง · เริ่ม Advanced Analytics + AI Ethics Review", "DPO / Analytics & AI", "D5, D6"],
  [{ runs: [run("Q8", { size: 28, bold: true })] }, "ประเมิน Maturity ซ้ำเทียบเป้า · Data Literacy ≥ 60% · ทบทวนแผนสู่ปี 2573", "CDO / Council", "D7, ทุกด้าน"],
]));
children.push(new Paragraph({ children: [run("เป้าสิ้นปีที่ 2: ", { bold: true, color: TEAL, size: 28 }), run("ค่าเฉลี่ย Maturity ≥ 3 (Defined) ทั่วองค์กร · KPI หลักเข้าเป้า · พร้อมต่อยอดสู่ระดับ 4–5", { size: 28, color: TEXT })], spacing: { before: 80 } }));

// ---- 8 policy ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("8. ข้อเสนอเชิงนโยบายเพื่อขออนุมัติ"));
children.push(body("ขอให้ผู้บริหารและสภามหาวิทยาลัยพิจารณา:"));
[
  "อนุมัติเชิงหลักการให้จัดตั้ง/ยกระดับศูนย์ฯ เป็นหน่วยงานระดับองค์กรที่รายงานตรงต่อผู้บริหารระดับสูง",
  "แต่งตั้ง CDO และ Data Governance Council เพื่อให้มีอำนาจกำกับข้ามหน่วยงาน",
  "สนับสนุนงบประมาณสำหรับบุคลากรหลัก แพลตฟอร์มข้อมูล และโปรแกรม Data Literacy ตามระยะใน Roadmap",
  "กำหนดให้รายงาน KPI ต่อสภามหาวิทยาลัยอย่างน้อยปีละ 2 ครั้ง เพื่อติดตามความก้าวหน้าสู่ Outstanding",
  "บรรจุเป้าหมายข้อมูลเป็นส่วนหนึ่งของแผนยุทธศาสตร์มหาวิทยาลัยและการประกันคุณภาพ (EdPEx/AUN-QA)",
].forEach(t => children.push(bullet([run(t, { size: 30 })], "policy")));
children.push(spacer(100));
children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({ children: [
  new TableCell({ borders, width: { size: CW, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, shading: { fill: ZEBRA, type: ShadingType.CLEAR }, children: [
    new Paragraph({ children: [run("ผลที่คาดว่าจะได้รับ: ", { bold: true, color: TEAL, size: 30 }), run("ภายในปี 2573 มหาวิทยาลัยจะเป็น Responsible Data-Driven University ที่ตัดสินใจด้วยข้อมูลอย่างชาญฉลาดและรับผิดชอบ มีความได้เปรียบเชิงแข่งขันที่ยั่งยืน และโดดเด่น (Outstanding) ในระดับ Data Maturity 4–5", { size: 30, color: TEXT })], spacing: { line: 300 } }),
  ] })
] })] }));
children.push(spacer(80));
children.push(new Paragraph({ children: [run("หมายเหตุ: ", { bold: true, color: MUTED, size: 26 }), run("ตัวเลข baseline และค่าประเมินในเอกสารนี้เป็นค่าประมาณเพื่อการนำเสนอ ควรยืนยันด้วยการสำรวจสถานะจริง (Data Maturity Assessment) ในระยะที่ 1 ก่อนผูกเป็นเป้าหมายผูกพัน", { size: 26, italic: true, color: MUTED })], spacing: { line: 290 } }));

// =================== assemble ===================
const doc = new Document({
  creator: "ศูนย์ DGSI",
  title: "ข้อเสนอเชิงยุทธศาสตร์ต่อผู้บริหาร — ศูนย์ DGSI",
  styles: {
    default: { document: { run: { font: FONT, size: 30 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: FONT, color: TEAL }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: FONT, color: TEALD }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 280 } } } }] },
      { reference: "policy", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 320 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("ศูนย์ธรรมาภิบาลข้อมูลและยุทธศาสตร์อัจฉริยะ (DGSI)  ·  หน้า ", { size: 24, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 24, color: MUTED })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buffer => { fs.writeFileSync("ข้อเสนอเชิงยุทธศาสตร์ DGSI (เอกสารผู้บริหาร).docx", buffer); console.log("WROTE docx", buffer.length, "bytes"); });
