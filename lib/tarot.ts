// ─────────────────────────────────────────────────────────────────────────────
// Tarot Database — Golden Dawn + Rider-Waite-Smith + Thoth system
// 78 cards: 22 Major Arcana + 56 Minor Arcana
// Most comprehensive academic system used in professional readings
// ─────────────────────────────────────────────────────────────────────────────

export type TarotCard = {
  id: string;
  name: string;
  nameTh: string;
  arcana: "major" | "minor";
  // Major Arcana
  number?: number;
  hebrewLetter?: string;
  kabbalisticPath?: string;
  thothName?: string;
  // Minor Arcana
  suit?: "wands" | "cups" | "swords" | "pentacles";
  suitTh?: string;
  rank?: number | string; // 1-10, Page, Knight, Queen, King
  // Astrological
  astro: string;
  element?: string;
  // Meanings
  keywords: string[];
  keywordsTh: string[];
  upright: string;   // full meaning
  reversed: string;  // reversed meaning
  symbol: string;    // emoji/symbol for display
};

export type DrawnCard = TarotCard & { isReversed: boolean };

export type CelticCrossSpread = {
  cards: DrawnCard[];
  positions: typeof CELTIC_CROSS_POSITIONS;
};

export const CELTIC_CROSS_POSITIONS = [
  { id: 1, name: "The Present",        nameTh: "สถานการณ์ปัจจุบัน",  desc: "พลังงานหลักที่ล้อมรอบคุณตอนนี้" },
  { id: 2, name: "The Challenge",      nameTh: "สิ่งที่ขวางกั้น",    desc: "อุปสรรคหรือพลังที่กำลังทดสอบ" },
  { id: 3, name: "The Foundation",     nameTh: "รากฐาน",             desc: "เหตุการณ์ในอดีตที่หล่อหลอมสถานการณ์นี้" },
  { id: 4, name: "The Recent Past",    nameTh: "อดีตใกล้",           desc: "สิ่งที่เพิ่งผ่านไปและยังส่งผล" },
  { id: 5, name: "The Crown",          nameTh: "เป้าหมายและศักยภาพ", desc: "สิ่งที่อาจเกิดขึ้นหรือเป้าหมายสูงสุด" },
  { id: 6, name: "The Near Future",    nameTh: "อนาคตใกล้",          desc: "สิ่งที่กำลังจะเกิดขึ้นในเร็วๆ นี้" },
  { id: 7, name: "Your Inner Self",    nameTh: "ตัวตนภายใน",         desc: "ทัศนคติและความรู้สึกลึกๆ ของคุณ" },
  { id: 8, name: "External Forces",   nameTh: "แรงภายนอก",          desc: "คนรอบข้างและสภาพแวดล้อมที่กระทบ" },
  { id: 9, name: "Hopes & Fears",     nameTh: "ความหวังและความกลัว", desc: "สิ่งที่คุณปรารถนาและเกรงกลัวพร้อมกัน" },
  { id: 10, name: "The Outcome",      nameTh: "ผลลัพธ์สุดท้าย",     desc: "ทิศทางที่ดวงดาวชี้หากเดินในแนวทางนี้" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MAJOR ARCANA (22 cards)
// ─────────────────────────────────────────────────────────────────────────────
const MAJOR_ARCANA: TarotCard[] = [
  {
    id: "major-0", name: "The Fool", nameTh: "นักเดินทาง", arcana: "major",
    number: 0, hebrewLetter: "Aleph", kabbalisticPath: "11", thothName: "The Fool",
    astro: "Uranus / Air", element: "Air",
    keywords: ["beginnings","spontaneity","innocence","freedom"],
    keywordsTh: ["จุดเริ่มต้น","ความบริสุทธิ์","อิสรภาพ","การผจญภัย"],
    upright: "พลังงานใหม่กำลังเริ่มต้น การก้าวออกจาก comfort zone ด้วยความกล้า จักรวาลกำลังเปิดประตูใหม่ให้คุณ ถึงเวลาเชื่อใจสัญชาตญาณและกระโดดเข้าสู่บทใหม่ของชีวิต",
    reversed: "ความประมาท การตัดสินใจโดยไม่ไตร่ตรอง ติดอยู่กับความกลัวจนไม่กล้าเริ่ม หรือเริ่มต้นสิ่งใหม่โดยไม่มีแผน",
    symbol: "🌅",
  },
  {
    id: "major-1", name: "The Magician", nameTh: "จอมเวทย์", arcana: "major",
    number: 1, hebrewLetter: "Beth", kabbalisticPath: "12", thothName: "The Magus",
    astro: "Mercury", element: "Air/Fire",
    keywords: ["willpower","skill","manifestation","resourcefulness"],
    keywordsTh: ["พลังเจตจำนง","ทักษะ","การสร้างสรรค์","ทรัพยากร"],
    upright: "คุณมีพลังและทักษะทุกอย่างที่จำเป็น ดาวพุธเปิดช่องทางการสื่อสารและความคิดสร้างสรรค์ ถึงเวลาลงมือทำสิ่งที่คิดไว้ พลังแห่งเจตจำนงของคุณสามารถเปลี่ยนความฝันให้เป็นจริงได้",
    reversed: "ใช้พลังงานผิดทาง การหลอกลวงตัวเองหรือผู้อื่น ทักษะที่ยังไม่ได้พัฒนา หรือมีพลังแต่ขาดทิศทาง",
    symbol: "🪄",
  },
  {
    id: "major-2", name: "The High Priestess", nameTh: "นักบวชหญิง", arcana: "major",
    number: 2, hebrewLetter: "Gimel", kabbalisticPath: "13", thothName: "The Priestess",
    astro: "Moon", element: "Water",
    keywords: ["intuition","mystery","subconscious","divine feminine"],
    keywordsTh: ["สัญชาตญาณ","ความลึกลับ","จิตใต้สำนึก","ปัญญา"],
    upright: "พระจันทร์กำลังเปิดเผยสิ่งซ่อนเร้น ฟังเสียงภายในของคุณ มีข้อมูลสำคัญที่ยังไม่ถูกเปิดเผย ความเงียบสงบคือกุญแจสู่คำตอบที่คุณตามหา",
    reversed: "ข้อมูลที่ถูกปิดบัง ละเลยสัญชาตญาณ ความลับที่จะถูกเปิดเผย หรือพึ่งพาผู้อื่นมากเกินไปแทนที่จะเชื่อตัวเอง",
    symbol: "🌙",
  },
  {
    id: "major-3", name: "The Empress", nameTh: "จักรพรรดินี", arcana: "major",
    number: 3, hebrewLetter: "Daleth", kabbalisticPath: "14", thothName: "The Empress",
    astro: "Venus", element: "Earth",
    keywords: ["abundance","fertility","nature","nurturing","creativity"],
    keywordsTh: ["ความอุดมสมบูรณ์","ความอบอุ่น","ธรรมชาติ","ความงาม","ความรัก"],
    upright: "ดาวศุกร์ส่งพลังแห่งความอุดมสมบูรณ์มาให้ ช่วงนี้เป็นเวลาแห่งการเติบโตในทุกด้าน ความรัก ความงาม ความสุขทางกายกำลังเบ่งบาน สิ่งที่ปลูกฝังไว้กำลังจะออกดอกออกผล",
    reversed: "ความขาดแคลน ละเลยตัวเอง ขาดความสร้างสรรค์ หรือพึ่งพาผู้อื่นมากเกินไป",
    symbol: "👑",
  },
  {
    id: "major-4", name: "The Emperor", nameTh: "จักรพรรดิ", arcana: "major",
    number: 4, hebrewLetter: "Heh", kabbalisticPath: "15", thothName: "The Emperor",
    astro: "Aries / Mars", element: "Fire",
    keywords: ["authority","structure","stability","leadership","control"],
    keywordsTh: ["อำนาจ","โครงสร้าง","เสถียรภาพ","ความเป็นผู้นำ","การควบคุม"],
    upright: "ดาวอาทิตย์ในราศีเมษให้พลังแห่งความเป็นผู้นำ ถึงเวลาสร้างโครงสร้างและระเบียบ ความมั่นคงกำลังจะมา ใช้สติปัญญาและความแข็งแกร่งในการสร้างสิ่งที่ยั่งยืน",
    reversed: "ความเผด็จการ ขาดความยืดหยุ่น การควบคุมมากเกินไป หรือขาดระเบียบวินัย",
    symbol: "⚔️",
  },
  {
    id: "major-5", name: "The Hierophant", nameTh: "นักบวชสูงสุด", arcana: "major",
    number: 5, hebrewLetter: "Vav", kabbalisticPath: "16", thothName: "The Hierophant",
    astro: "Taurus / Venus", element: "Earth",
    keywords: ["tradition","wisdom","institution","spiritual guidance","conformity"],
    keywordsTh: ["ประเพณี","ปัญญา","คำสอน","จิตวิญญาณ","สถาบัน"],
    upright: "ดาวพฤหัสบดีในราศีพฤษภนำพลังแห่งปัญญาและประเพณี การขอคำแนะนำจากผู้รู้จะเป็นประโยชน์ มีบทเรียนสำคัญที่ต้องเรียนรู้ ระบบและกฎเกณฑ์จะช่วยคุณในตอนนี้",
    reversed: "หัวโบราณ ต่อต้านระบบ หรือคำสอนที่ผิดทาง ควรตั้งคำถามกับความเชื่อเดิม",
    symbol: "🏛️",
  },
  {
    id: "major-6", name: "The Lovers", nameTh: "คนรัก", arcana: "major",
    number: 6, hebrewLetter: "Zayin", kabbalisticPath: "17", thothName: "The Lovers",
    astro: "Gemini / Mercury", element: "Air",
    keywords: ["love","harmony","choice","alignment","relationships"],
    keywordsTh: ["ความรัก","ความกลมกลืน","การเลือก","ความสัมพันธ์","พันธะ"],
    upright: "ดาวพุธในราศีเมถุนส่งพลังแห่งการเลือกและความรัก ความสัมพันธ์ที่ลึกซึ้งกำลังก่อตัว หรือต้องตัดสินใจครั้งสำคัญที่จะเปลี่ยนชีวิต ทั้งหัวใจและสติปัญญาต้องทำงานร่วมกัน",
    reversed: "ความไม่สมดุลในความสัมพันธ์ การตัดสินใจผิดพลาด ความขัดแย้งภายใน หรือความรักที่ไม่สมหวัง",
    symbol: "💑",
  },
  {
    id: "major-7", name: "The Chariot", nameTh: "รถศึก", arcana: "major",
    number: 7, hebrewLetter: "Cheth", kabbalisticPath: "18", thothName: "The Chariot",
    astro: "Cancer / Moon", element: "Water",
    keywords: ["victory","willpower","control","determination","triumph"],
    keywordsTh: ["ชัยชนะ","เจตจำนง","การควบคุม","ความมุ่งมั่น","ความสำเร็จ"],
    upright: "พลังแห่งชัยชนะกำลังมา การต่อสู้ที่ผ่านมาจะนำไปสู่ความสำเร็จ ควบคุมพลังงานที่ขัดแย้งกันภายในตัวเองให้ได้ ความมุ่งมั่นจะพาคุณข้ามอุปสรรคทุกอย่าง",
    reversed: "ขาดทิศทาง ความเอาแต่ใจ ความก้าวร้าว หรือถูกแรงภายนอกควบคุม",
    symbol: "🏆",
  },
  {
    id: "major-8", name: "Strength", nameTh: "พลัง", arcana: "major",
    number: 8, hebrewLetter: "Teth", kabbalisticPath: "19", thothName: "Lust",
    astro: "Leo / Sun", element: "Fire",
    keywords: ["courage","patience","compassion","inner strength","taming"],
    keywordsTh: ["ความกล้าหาญ","ความอดทน","ความเมตตา","พลังภายใน","การควบคุมตัวเอง"],
    upright: "ดวงอาทิตย์ในราศีสิงห์ให้พลังแห่งความกล้าหาญที่แท้จริง ไม่ใช่พลังกาย แต่คือพลังใจและความเมตตา คุณมีความแข็งแกร่งภายในมากกว่าที่คิด ใช้ความอ่อนโยนเพื่อปราบความดุร้าย",
    reversed: "ความอ่อนแอ ความสงสัยในตัวเอง ขาดความมั่นใจ หรือใช้พลังงานในทางที่ผิด",
    symbol: "🦁",
  },
  {
    id: "major-9", name: "The Hermit", nameTh: "ฤาษี", arcana: "major",
    number: 9, hebrewLetter: "Yod", kabbalisticPath: "20", thothName: "The Hermit",
    astro: "Virgo / Mercury", element: "Earth",
    keywords: ["introspection","solitude","guidance","wisdom","inner truth"],
    keywordsTh: ["การมองภายใน","ความสันโดษ","แนวทาง","ปัญญา","ความจริงภายใน"],
    upright: "ดาวพุธในราศีกันย์ให้ปัญญาแห่งการไตร่ตรอง ถึงเวลาหยุดพักจากโลกภายนอกเพื่อค้นหาคำตอบจากภายใน แสงโคมไฟของฤาษีคือสัญชาตญาณของคุณเอง ความเงียบจะนำความชัดเจนมาให้",
    reversed: "โดดเดี่ยวเกินไป ปิดกั้นตัวเอง หรือหนีจากความจริง",
    symbol: "🕯️",
  },
  {
    id: "major-10", name: "Wheel of Fortune", nameTh: "วงล้อแห่งโชคชะตา", arcana: "major",
    number: 10, hebrewLetter: "Kaph", kabbalisticPath: "21", thothName: "Fortune",
    astro: "Jupiter", element: "Fire",
    keywords: ["fate","cycles","turning point","luck","karma"],
    keywordsTh: ["โชคชะตา","วัฏจักร","จุดเปลี่ยน","โชค","กรรม"],
    upright: "ดาวพฤหัสบดีกำลังหมุนวงล้อแห่งโชคชะตา การเปลี่ยนแปลงครั้งใหญ่กำลังมา สิ่งที่เคยหยุดชะงักจะเริ่มเคลื่อนไหว โชคดีกำลังจะหวนคืน วงจรชีวิตกำลังเปลี่ยนทิศทาง",
    reversed: "โชคร้าย ต้านทานการเปลี่ยนแปลง หรือวนซ้ำรูปแบบเดิม",
    symbol: "☸️",
  },
  {
    id: "major-11", name: "Justice", nameTh: "ความยุติธรรม", arcana: "major",
    number: 11, hebrewLetter: "Lamed", kabbalisticPath: "22", thothName: "Adjustment",
    astro: "Libra / Venus", element: "Air",
    keywords: ["justice","truth","cause and effect","law","balance"],
    keywordsTh: ["ความยุติธรรม","ความจริง","กฎแห่งกรรม","กฎหมาย","ความสมดุล"],
    upright: "ดาวศุกร์ในราศีตุลย์นำพลังแห่งความยุติธรรม กรรมกำลังทำงาน สิ่งที่คุณทำไปจะได้รับกลับคืน การตัดสินใจที่สำคัญต้องใช้ความยุติธรรมและความสมดุล ความจริงจะถูกเปิดเผย",
    reversed: "ความอยุติธรรม การหลีกเลี่ยงความรับผิดชอบ หรือระบบที่ไม่เที่ยงธรรม",
    symbol: "⚖️",
  },
  {
    id: "major-12", name: "The Hanged Man", nameTh: "ชายแขวนคอ", arcana: "major",
    number: 12, hebrewLetter: "Mem", kabbalisticPath: "23", thothName: "The Hanged Man",
    astro: "Neptune / Water", element: "Water",
    keywords: ["surrender","perspective","pause","sacrifice","enlightenment"],
    keywordsTh: ["การปล่อยวาง","มุมมองใหม่","การหยุดพัก","การเสียสละ","ความรู้แจ้ง"],
    upright: "ดาวเนปจูนแนะให้หยุดและมองโลกจากมุมใหม่ การยอมรับในสิ่งที่ควบคุมไม่ได้คือพลัง ช่วงนี้ต้องรอและสังเกต ไม่ใช่เวลาบังคับให้เกิดขึ้น ปล่อยวางแล้วคำตอบจะมาเอง",
    reversed: "ติดอยู่ในสถานการณ์เดิม ไม่ยอมเสียสละ หรือเสียสละโดยไม่จำเป็น",
    symbol: "🙃",
  },
  {
    id: "major-13", name: "Death", nameTh: "ความตาย", arcana: "major",
    number: 13, hebrewLetter: "Nun", kabbalisticPath: "24", thothName: "Death",
    astro: "Scorpio / Pluto", element: "Water",
    keywords: ["transformation","endings","transition","change","renewal"],
    keywordsTh: ["การเปลี่ยนแปลง","การสิ้นสุด","การเปลี่ยนผ่าน","การเกิดใหม่","การปล่อยวาง"],
    upright: "ดาวพลูโตในราศีพิจิกนำการเปลี่ยนแปลงครั้งใหญ่ สิ่งหนึ่งกำลังจะสิ้นสุดเพื่อให้สิ่งใหม่เกิดขึ้น ไม่ใช่ความตายทางกาย แต่คือการตายของสิ่งที่ไม่เป็นประโยชน์อีกต่อไป ยอมรับการเปลี่ยนแปลง",
    reversed: "ต้านทานการเปลี่ยนแปลง ยึดติดกับอดีต หรือความเปลี่ยนแปลงที่ล่าช้าออกไป",
    symbol: "🌑",
  },
  {
    id: "major-14", name: "Temperance", nameTh: "ความพอดี", arcana: "major",
    number: 14, hebrewLetter: "Samekh", kabbalisticPath: "25", thothName: "Art",
    astro: "Sagittarius / Jupiter", element: "Fire",
    keywords: ["balance","moderation","patience","purpose","healing"],
    keywordsTh: ["สมดุล","ความพอดี","ความอดทน","จุดมุ่งหมาย","การรักษา"],
    upright: "ดาวพฤหัสบดีในราศีธนูนำพลังแห่งความสมดุลและการรักษา ผสมผสานสิ่งตรงข้ามอย่างลงตัว ความอดทนจะได้รับผลตอบแทน ร่างกายและจิตใจกำลังฟื้นฟู ดาวนำพาคุณไปสู่จุดมุ่งหมายอย่างช้าๆ แต่มั่นคง",
    reversed: "ขาดความสมดุล ความสุดโต่ง ไม่มีจุดมุ่งหมาย หรือความขัดแย้งภายใน",
    symbol: "✨",
  },
  {
    id: "major-15", name: "The Devil", nameTh: "ปีศาจ", arcana: "major",
    number: 15, hebrewLetter: "Ayin", kabbalisticPath: "26", thothName: "The Devil",
    astro: "Capricorn / Saturn", element: "Earth",
    keywords: ["bondage","materialism","shadow","addiction","illusion"],
    keywordsTh: ["การถูกพันธนาการ","วัตถุนิยม","เงามืด","การเสพติด","ภาพลวงตา"],
    upright: "ดาวเสาร์ในราศีมังกรเปิดเผยสิ่งที่ยึดติดคุณอยู่ มีบางอย่างที่กดทับคุณโดยไม่รู้ตัว ความกลัว ความโลภ หรือความสัมพันธ์ที่เป็นพิษ ถึงเวลาตัดโซ่ตรวนที่ล่ามตัวเองไว้",
    reversed: "ได้รับอิสรภาพ ปลดปล่อยตัวเองจากสิ่งที่ยึดติด หรือเริ่มตระหนักถึงรูปแบบที่เป็นอันตราย",
    symbol: "⛓️",
  },
  {
    id: "major-16", name: "The Tower", nameTh: "หอคอย", arcana: "major",
    number: 16, hebrewLetter: "Peh", kabbalisticPath: "27", thothName: "The Tower",
    astro: "Mars", element: "Fire",
    keywords: ["upheaval","chaos","revelation","awakening","destruction"],
    keywordsTh: ["การพังทลาย","ความโกลาหล","การเปิดเผยความจริง","การตื่นรู้","การทำลาย"],
    upright: "ดาวอังคารนำพาการพังทลายของสิ่งที่สร้างบนรากฐานที่ผิด การเปลี่ยนแปลงที่ฉับพลันและรุนแรงกำลังจะเกิดขึ้น แต่นั่นคือการทำลายเพื่อสร้างใหม่บนรากฐานที่แข็งแกร่งกว่า",
    reversed: "หลีกเลี่ยงความหายนะที่ควรจะเกิด หรือความโกลาหลที่ล่าช้าออกไป",
    symbol: "⚡",
  },
  {
    id: "major-17", name: "The Star", nameTh: "ดาวฤกษ์", arcana: "major",
    number: 17, hebrewLetter: "Tzaddi", kabbalisticPath: "28", thothName: "The Star",
    astro: "Aquarius / Uranus", element: "Air",
    keywords: ["hope","inspiration","serenity","renewal","healing"],
    keywordsTh: ["ความหวัง","แรงบันดาลใจ","ความสงบ","การฟื้นฟู","การรักษา"],
    upright: "หลังพายุมีดาวเสมอ ดาวยูเรนัสในราศีกุมภ์นำแสงแห่งความหวังกลับมา ช่วงเวลาแห่งการรักษาและฟื้นฟูกำลังจะมาถึง เชื่อในจักรวาล สิ่งที่หวังไว้กำลังจะเป็นจริง",
    reversed: "ขาดความหวัง ผิดหวัง หรือไม่เชื่อในตัวเองและจักรวาล",
    symbol: "⭐",
  },
  {
    id: "major-18", name: "The Moon", nameTh: "ดวงจันทร์", arcana: "major",
    number: 18, hebrewLetter: "Qoph", kabbalisticPath: "29", thothName: "The Moon",
    astro: "Pisces / Neptune", element: "Water",
    keywords: ["illusion","fear","subconscious","confusion","dreams"],
    keywordsTh: ["ภาพลวงตา","ความกลัว","จิตใต้สำนึก","ความสับสน","ความฝัน"],
    upright: "ดาวเนปจูนในราศีมีนเปิดเผยสิ่งซ่อนอยู่ในความมืด ไม่ใช่ทุกสิ่งที่เห็นคือความจริง ความกลัวและความเข้าใจผิดกำลังเล่นงานคุณ ระวังการตัดสินใจในช่วงนี้ ความจริงจะชัดเจนขึ้นเมื่อพระอาทิตย์ขึ้น",
    reversed: "ความสับสนเริ่มคลี่คลาย ความลับถูกเปิดเผย หรือหลุดพ้นจากความกลัว",
    symbol: "🌕",
  },
  {
    id: "major-19", name: "The Sun", nameTh: "ดวงอาทิตย์", arcana: "major",
    number: 19, hebrewLetter: "Resh", kabbalisticPath: "30", thothName: "The Sun",
    astro: "Sun / Leo", element: "Fire",
    keywords: ["joy","success","vitality","clarity","abundance"],
    keywordsTh: ["ความสุข","ความสำเร็จ","ชีวิตชีวา","ความชัดเจน","ความอุดมสมบูรณ์"],
    upright: "พลังดวงอาทิตย์ส่องสว่างทุกทิศ ความสำเร็จและความสุขกำลังเข้ามาในชีวิตอย่างเต็มที่ ทุกอย่างที่พยายามทำอยู่กำลังจะสำเร็จ ช่วงนี้เป็นช่วงที่ดีที่สุดในรอบปี",
    reversed: "ความสุขชั่วคราว ความสำเร็จที่ล่าช้า หรือมองไม่เห็นสิ่งดีที่มีอยู่",
    symbol: "☀️",
  },
  {
    id: "major-20", name: "Judgement", nameTh: "การพิพากษา", arcana: "major",
    number: 20, hebrewLetter: "Shin", kabbalisticPath: "31", thothName: "The Aeon",
    astro: "Pluto / Fire", element: "Fire",
    keywords: ["reflection","reckoning","awakening","absolution","renewal"],
    keywordsTh: ["การไตร่ตรอง","การตัดสิน","การตื่นรู้","การอภัย","การเกิดใหม่"],
    upright: "ดาวพลูโตนำการเรียกร้องสู่จุดสูงสุด บทเรียนชีวิตกำลังจะครบรอบ ถึงเวลาตัดสินใจครั้งใหญ่ที่จะเปลี่ยนชีวิต การอภัยตัวเองและผู้อื่นจะนำไปสู่การเกิดใหม่",
    reversed: "ปฏิเสธการเรียกร้องของชีวิต ไม่ยอมรับบทเรียน หรือตัดสินตัวเองรุนแรงเกินไป",
    symbol: "📯",
  },
  {
    id: "major-21", name: "The World", nameTh: "โลก", arcana: "major",
    number: 21, hebrewLetter: "Tav", kabbalisticPath: "32", thothName: "The Universe",
    astro: "Saturn / Earth", element: "Earth",
    keywords: ["completion","integration","accomplishment","wholeness","travel"],
    keywordsTh: ["ความสมบูรณ์","บูรณาการ","ความสำเร็จ","ความครบถ้วน","การเดินทาง"],
    upright: "วงจรสมบูรณ์แล้ว ความสำเร็จที่แท้จริงกำลังมาถึง คุณได้เรียนรู้และเติบโตจนครบทุกด้าน ดาวเสาร์รับรองว่าสิ่งที่สร้างมาอย่างมั่นคงจะคงทนยั่งยืน โลกทั้งใบรอต้อนรับคุณ",
    reversed: "วงจรยังไม่สมบูรณ์ เส้นชัยที่ล่าช้า หรือขาดบทสรุปที่ดี",
    symbol: "🌍",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MINOR ARCANA — WANDS (Fire / Aries, Leo, Sagittarius)
// ─────────────────────────────────────────────────────────────────────────────
const WANDS: TarotCard[] = [
  { id:"wands-1", name:"Ace of Wands", nameTh:"เอซไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:1, astro:"Aries season / Fire", element:"Fire", symbol:"🔥", keywords:["inspiration","new beginnings","creativity","potential"], keywordsTh:["แรงบันดาลใจ","จุดเริ่มต้น","ความคิดสร้างสรรค์","ศักยภาพ"], upright:"ไฟแห่งความคิดสร้างสรรค์กำลังจุดขึ้น โอกาสใหม่ด้านความคิด โปรเจกต์ใหม่ หรือแรงบันดาลใจที่ทรงพลังกำลังมา ถึงเวลาลงมือสร้างสิ่งใหม่", reversed:"ล่าช้า ขาดแรงบันดาลใจ ไม่รู้จะเริ่มจากไหน" },
  { id:"wands-2", name:"Two of Wands", nameTh:"สองไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:2, astro:"Mars in Aries", element:"Fire", symbol:"🌐", keywords:["planning","future vision","discovery","decisions"], keywordsTh:["การวางแผน","วิสัยทัศน์","การค้นพบ","การตัดสินใจ"], upright:"คุณมองเห็นอนาคตที่กว้างใหญ่ ถึงเวลาวางแผนการเดินทางหรือโปรเจกต์ใหม่ที่จะขยายขอบเขตชีวิต", reversed:"ขาดแผน ความกลัวต่อสิ่งที่ไม่รู้จัก หรือแผนที่ล้มเหลว" },
  { id:"wands-3", name:"Three of Wands", nameTh:"สามไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:3, astro:"Sun in Aries", element:"Fire", symbol:"🚀", keywords:["expansion","foresight","progress","opportunity"], keywordsTh:["การขยาย","การมองการณ์ไกล","ความก้าวหน้า","โอกาส"], upright:"สิ่งที่เริ่มไว้กำลังขยายออกไป ผลจากความพยายามกำลังจะปรากฏ โอกาสจากต่างถิ่นหรือต่างประเทศกำลังมา", reversed:"ความล่าช้า แผนที่ยังไม่เป็นผล หรือขาดการมองการณ์ไกล" },
  { id:"wands-4", name:"Four of Wands", nameTh:"สี่ไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:4, astro:"Venus in Aries", element:"Fire", symbol:"🎉", keywords:["celebration","harmony","homecoming","stability"], keywordsTh:["การเฉลิมฉลอง","ความกลมเกลียว","บ้านที่มั่นคง","ความสุข"], upright:"เวลาแห่งการเฉลิมฉลองและความสุข ความสัมพันธ์ที่ดีงาม บ้านที่อบอุ่น หรือความสำเร็จที่น่าภาคภูมิใจกำลังมาถึง", reversed:"ความขัดแย้งในบ้าน การเฉลิมฉลองที่ล่าช้า หรือความไม่มั่นคง" },
  { id:"wands-5", name:"Five of Wands", nameTh:"ห้าไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:5, astro:"Saturn in Leo", element:"Fire", symbol:"⚔️", keywords:["conflict","competition","tension","diversity"], keywordsTh:["ความขัดแย้ง","การแข่งขัน","ความตึงเครียด","ความหลากหลาย"], upright:"การแข่งขันและความขัดแย้งกำลังทดสอบคุณ แต่นี่คือการฝึกฝนที่จะทำให้แข็งแกร่งขึ้น ใช้ความคิดสร้างสรรค์แก้ปัญหา", reversed:"หลีกเลี่ยงความขัดแย้งได้ หรือความขัดแย้งภายในตัวเอง" },
  { id:"wands-6", name:"Six of Wands", nameTh:"หกไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:6, astro:"Jupiter in Leo", element:"Fire", symbol:"🏅", keywords:["victory","recognition","progress","confidence"], keywordsTh:["ชัยชนะ","การยอมรับ","ความก้าวหน้า","ความมั่นใจ"], upright:"ชัยชนะและการยอมรับจากผู้อื่นกำลังมาถึง ผลงานของคุณได้รับการมองเห็น ความสำเร็จที่รอคอยมานานกำลังจะมา", reversed:"ความล้มเหลวชั่วคราว ความหยิ่งผยอง หรือขาดการยอมรับ" },
  { id:"wands-7", name:"Seven of Wands", nameTh:"เจ็ดไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:7, astro:"Mars in Leo", element:"Fire", symbol:"🛡️", keywords:["defense","challenge","perseverance","conviction"], keywordsTh:["การป้องกัน","การท้าทาย","ความอดทน","ความเชื่อมั่น"], upright:"คุณต้องปกป้องสิ่งที่สร้างมา การแข่งขันสูงแต่คุณมีความได้เปรียบ ยืนหยัดในความเชื่อของตัวเอง", reversed:"ยอมแพ้เร็วเกินไป ขาดความมั่นใจ หรือรู้สึกท่วมท้น" },
  { id:"wands-8", name:"Eight of Wands", nameTh:"แปดไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:8, astro:"Mercury in Sagittarius", element:"Fire", symbol:"💨", keywords:["speed","movement","communication","swift action"], keywordsTh:["ความเร็ว","การเคลื่อนไหว","การสื่อสาร","การกระทำที่รวดเร็ว"], upright:"ทุกอย่างกำลังเร่งขึ้น ข่าวดีกำลังจะมาถึงเร็วๆ นี้ การเดินทาง การสื่อสาร หรือโปรเจกต์กำลังก้าวหน้าอย่างรวดเร็ว", reversed:"ความล่าช้า ความสับสนในการสื่อสาร หรือรีบร้อนเกินไป" },
  { id:"wands-9", name:"Nine of Wands", nameTh:"เก้าไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:9, astro:"Moon in Sagittarius", element:"Fire", symbol:"💪", keywords:["resilience","persistence","last stretch","wounded warrior"], keywordsTh:["ความยืดหยุ่น","ความอดทน","ช่วงสุดท้าย","นักรบผู้บาดเจ็บ"], upright:"คุณเหนื่อยแต่ยังไม่ถึงเส้นชัย อย่ายอมแพ้ตอนนี้ บทเรียนที่ผ่านมาคือเกราะป้องกัน อีกก้าวเดียวถึงความสำเร็จ", reversed:"หมดแรง ยอมแพ้เมื่อใกล้ถึงเส้นชัย หรือระวังตัวมากเกินไป" },
  { id:"wands-10", name:"Ten of Wands", nameTh:"สิบไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:10, astro:"Saturn in Sagittarius", element:"Fire", symbol:"😤", keywords:["burden","responsibility","hard work","completion"], keywordsTh:["ภาระ","ความรับผิดชอบ","การทำงานหนัก","การสำเร็จ"], upright:"ภาระหนักเกินไป คุณแบกรับมากเกินความจำเป็น ถึงเวลามอบหมายงาน หรือวางภาระที่ไม่ใช่ของคุณลง", reversed:"วางภาระได้แล้ว หรือเรียนรู้ที่จะขอความช่วยเหลือ" },
  { id:"wands-page", name:"Page of Wands", nameTh:"เพจไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:"Page", astro:"Earth of Fire", element:"Fire/Earth", symbol:"🌱", keywords:["enthusiasm","adventure","discovery","free spirit"], keywordsTh:["ความกระตือรือร้น","การผจญภัย","การค้นพบ","จิตใจเสรี"], upright:"พลังงานใหม่ที่เต็มไปด้วยความกระตือรือร้น ข่าวดีกำลังจะมา หรือแนวคิดใหม่ที่น่าตื่นเต้นกำลังจะปรากฏ", reversed:"ขาดทิศทาง ความคิดที่ยังไม่สุกงอม หรือข่าวที่ล่าช้า" },
  { id:"wands-knight", name:"Knight of Wands", nameTh:"อัศวินไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:"Knight", astro:"Fire of Fire", element:"Fire", symbol:"🏇", keywords:["action","adventure","impulsiveness","passion"], keywordsTh:["การกระทำ","การผจญภัย","ความหุนหันพลันแล่น","ความหลงใหล"], upright:"พลังงานแห่งการลงมือทำอย่างเต็มกำลัง การผจญภัยและการเปลี่ยนแปลงอย่างรวดเร็วกำลังจะมา ลุยเลย", reversed:"หุนหันพลันแล่น ขาดทิศทาง หรือพลังงานที่กระจัดกระจาย" },
  { id:"wands-queen", name:"Queen of Wands", nameTh:"ราชินีไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:"Queen", astro:"Water of Fire", element:"Fire/Water", symbol:"👸", keywords:["courage","confidence","independence","social butterfly"], keywordsTh:["ความกล้าหาญ","ความมั่นใจ","ความเป็นอิสระ","เสน่ห์"], upright:"พลังงานแห่งความมั่นใจและเสน่ห์ดึงดูด คุณหรือคนรอบข้างที่มีบุคลิกแข็งแกร่ง อบอุ่น และสร้างแรงบันดาลใจ", reversed:"ความอิจฉา ความเย่อหยิ่ง หรือขาดความมั่นใจในตัวเอง" },
  { id:"wands-king", name:"King of Wands", nameTh:"กษัตริย์ไม้เท้า", arcana:"minor", suit:"wands", suitTh:"ไม้เท้า", rank:"King", astro:"Air of Fire", element:"Fire/Air", symbol:"👨‍💼", keywords:["leadership","vision","entrepreneur","honor"], keywordsTh:["ความเป็นผู้นำ","วิสัยทัศน์","ผู้ประกอบการ","เกียรติ"], upright:"ผู้นำที่มีวิสัยทัศน์และพลังงานสูง ถึงเวลาใช้ความเป็นผู้นำขับเคลื่อนสิ่งที่ต้องการ", reversed:"ผู้นำที่เผด็จการ หุนหันพลันแล่น หรือขาดภาวะผู้นำ" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MINOR ARCANA — CUPS (Water / Cancer, Scorpio, Pisces)
// ─────────────────────────────────────────────────────────────────────────────
const CUPS: TarotCard[] = [
  { id:"cups-1", name:"Ace of Cups", nameTh:"เอซถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:1, astro:"Cancer season / Water", element:"Water", symbol:"💧", keywords:["love","new emotions","intuition","spirituality"], keywordsTh:["ความรัก","อารมณ์ใหม่","สัญชาตญาณ","จิตวิญญาณ"], upright:"ถ้วยแห่งความรักล้นออกมา ความรักใหม่ ความสัมพันธ์ใหม่ หรือการเปิดใจรับสิ่งใหม่กำลังจะมาถึง จิตใจเปิดกว้างพร้อมรับความสุข", reversed:"ปิดกั้นความรัก ความสัมพันธ์ที่ยังไม่พร้อม หรืออารมณ์ที่ถูกกดทับ" },
  { id:"cups-2", name:"Two of Cups", nameTh:"สองถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:2, astro:"Venus in Cancer", element:"Water", symbol:"💑", keywords:["partnership","attraction","connection","unity"], keywordsTh:["หุ้นส่วน","การดึงดูด","ความผูกพัน","ความเป็นหนึ่งเดียว"], upright:"ความสัมพันธ์ที่ลึกซึ้งและสมดุล ความรักที่แท้จริง หรือหุ้นส่วนที่สมบูรณ์แบบกำลังก่อตัวขึ้น", reversed:"ความสัมพันธ์ที่แตกแยก การสูญเสีย หรือความไม่สมดุล" },
  { id:"cups-3", name:"Three of Cups", nameTh:"สามถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:3, astro:"Mercury in Cancer", element:"Water", symbol:"🥂", keywords:["celebration","friendship","creativity","community"], keywordsTh:["การเฉลิมฉลอง","มิตรภาพ","ความสร้างสรรค์","ชุมชน"], upright:"เวลาแห่งการเฉลิมฉลองกับคนที่รัก ความสุขจากมิตรภาพและสังคม ข่าวดีหรืองานฉลองกำลังจะมา", reversed:"ความสัมพันธ์ที่ตึงเครียด ปาร์ตี้ที่เกินพอดี หรือมิตรที่ไม่จริงใจ" },
  { id:"cups-4", name:"Four of Cups", nameTh:"สี่ถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:4, astro:"Moon in Cancer", element:"Water", symbol:"😔", keywords:["contemplation","apathy","reevaluation","withdrawal"], keywordsTh:["การไตร่ตรอง","ความเฉยเมย","การประเมินใหม่","การถอยตัว"], upright:"คุณกำลังรู้สึกเบื่อหน่ายหรือไม่พอใจ แต่มีโอกาสใหม่รอยื่นให้อยู่ที่ตรงหน้า หยุดมองภายในและเปิดใจรับสิ่งใหม่", reversed:"เปิดใจรับโอกาสใหม่ หรือออกจากความซึมเศร้าได้" },
  { id:"cups-5", name:"Five of Cups", nameTh:"ห้าถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:5, astro:"Mars in Scorpio", element:"Water", symbol:"😢", keywords:["loss","grief","regret","sorrow"], keywordsTh:["การสูญเสีย","ความเศร้า","ความเสียใจ","ความโศกเศร้า"], upright:"ความเสียใจและการสูญเสียกำลังเยียบย่ำจิตใจ แต่ยังมีถ้วยที่ยังตั้งอยู่สองใบ อย่าลืมมองสิ่งที่ยังคงอยู่", reversed:"ยอมรับการสูญเสียได้ เริ่มก้าวข้ามความเศร้า หรือการคืนดี" },
  { id:"cups-6", name:"Six of Cups", nameTh:"หกถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:6, astro:"Sun in Scorpio", element:"Water", symbol:"🌸", keywords:["nostalgia","childhood","innocence","memories"], keywordsTh:["ความคิดถึง","วัยเด็ก","ความบริสุทธิ์","ความทรงจำ"], upright:"พลังงานแห่งอดีตที่ดีงามกำลังหวนกลับมา คนจากอดีตอาจปรากฏตัว หรือความทรงจำดีๆ กำลังนำแรงบันดาลใจมาให้", reversed:"อยู่กับอดีตมากเกินไป ไม่ยอมก้าวไปข้างหน้า" },
  { id:"cups-7", name:"Seven of Cups", nameTh:"เจ็ดถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:7, astro:"Venus in Scorpio", element:"Water", symbol:"🌈", keywords:["illusion","fantasy","choices","imagination"], keywordsTh:["ภาพลวงตา","จินตนาการ","ทางเลือก","ความฝัน"], upright:"มีทางเลือกมากมายแต่อาจไม่ใช่ทั้งหมดที่เป็นจริง ระวังการหลอกตัวเองด้วยความฝันที่ไม่เป็นจริง ตัดสินใจด้วยสติ", reversed:"ออกจากภาพลวงตา มองความจริง หรือเลือกทางที่ชัดเจน" },
  { id:"cups-8", name:"Eight of Cups", nameTh:"แปดถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:8, astro:"Saturn in Pisces", element:"Water", symbol:"🚶", keywords:["walking away","disillusionment","seeking deeper meaning"], keywordsTh:["การจากไป","ความผิดหวัง","การตามหาความหมาย"], upright:"ถึงเวลาทิ้งสิ่งที่ไม่ตอบสนองจิตวิญญาณแล้ว การเดินจากไปคือความกล้าหาญ ตามหาสิ่งที่มีความหมายลึกกว่า", reversed:"กลับมาหาสิ่งที่ทิ้งไป หรือกลัวที่จะก้าวออกไป" },
  { id:"cups-9", name:"Nine of Cups", nameTh:"เก้าถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:9, astro:"Jupiter in Pisces", element:"Water", symbol:"😊", keywords:["contentment","satisfaction","wish fulfillment","gratitude"], keywordsTh:["ความพึงพอใจ","ความสุข","ความปรารถนาสมหวัง","ความกตัญญู"], upright:"ใบ wish card ของไพ่ทาโร่ ความปรารถนาที่ลึกที่สุดกำลังจะสมหวัง ความสุขและความพึงพอใจกำลังจะมาเต็มที่", reversed:"ความพึงพอใจที่ยังขาดอยู่ หรือความสุขที่ต้องแลกด้วยราคา" },
  { id:"cups-10", name:"Ten of Cups", nameTh:"สิบถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:10, astro:"Mars in Pisces", element:"Water", symbol:"🌈", keywords:["divine love","bliss","harmony","family"], keywordsTh:["ความรักสมบูรณ์","ความสุขสมบูรณ์","ความกลมเกลียว","ครอบครัว"], upright:"ความสุขสมบูรณ์ในชีวิตครอบครัวและความสัมพันธ์ สายรุ้งแห่งความฝันกำลังจะเป็นจริง ความรักและความกลมเกลียวในบ้าน", reversed:"ความขัดแย้งในครอบครัว ความสุขที่ไม่สมบูรณ์ หรือค่านิยมที่แตกต่างกัน" },
  { id:"cups-page", name:"Page of Cups", nameTh:"เพจถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:"Page", astro:"Earth of Water", element:"Water/Earth", symbol:"🐟", keywords:["creative opportunities","intuition","new emotions"], keywordsTh:["โอกาสสร้างสรรค์","สัญชาตญาณ","อารมณ์ใหม่"], upright:"ข่าวดีทางอารมณ์หรือความรัก ความคิดสร้างสรรค์ใหม่ หรือการเปิดรับความรู้สึกของตัวเอง", reversed:"อารมณ์ที่ไม่สุกงอม การหลอกลวง หรือข่าวร้ายที่ไม่คาดคิด" },
  { id:"cups-knight", name:"Knight of Cups", nameTh:"อัศวินถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:"Knight", astro:"Fire of Water", element:"Water/Fire", symbol:"🤴", keywords:["romance","charm","imagination","following the heart"], keywordsTh:["ความโรแมนติก","เสน่ห์","จินตนาการ","ตามหัวใจ"], upright:"อัศวินแห่งความรักกำลังมา ข้อเสนอที่น่าตื่นเต้น ความรักที่โรแมนติก หรือการตามหัวใจตัวเอง", reversed:"คนที่หลอกลวงด้วยความโรแมนติก หรือความฝันที่ไม่เป็นจริง" },
  { id:"cups-queen", name:"Queen of Cups", nameTh:"ราชินีถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:"Queen", astro:"Water of Water", element:"Water", symbol:"🧜‍♀️", keywords:["compassion","intuition","emotional security","nurturing"], keywordsTh:["ความเมตตา","สัญชาตญาณ","ความมั่นคงทางอารมณ์","การดูแลเอาใจใส่"], upright:"พลังงานแห่งความเมตตาและสัญชาตญาณสูง เชื่อความรู้สึกของตัวเอง ดูแลตัวเองและคนที่รัก", reversed:"การพึ่งพาทางอารมณ์ ความหวั่นไหวมากเกินไป หรือการจมอยู่กับอารมณ์" },
  { id:"cups-king", name:"King of Cups", nameTh:"กษัตริย์ถ้วย", arcana:"minor", suit:"cups", suitTh:"ถ้วย", rank:"King", astro:"Air of Water", element:"Water/Air", symbol:"🔱", keywords:["emotional balance","compassion","wisdom","diplomacy"], keywordsTh:["สมดุลอารมณ์","ความเมตตา","ปัญญา","การทูต"], upright:"ผู้ที่มีสมดุลทางอารมณ์สูง ใช้ความเมตตาและปัญญาในการตัดสินใจ มีคนฉลาดและใจกว้างคอยช่วยเหลือ", reversed:"ขาดสมดุลทางอารมณ์ การปิดกั้นความรู้สึก หรือการใช้อำนาจในทางที่ผิด" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MINOR ARCANA — SWORDS (Air / Gemini, Libra, Aquarius)
// ─────────────────────────────────────────────────────────────────────────────
const SWORDS: TarotCard[] = [
  { id:"swords-1", name:"Ace of Swords", nameTh:"เอซดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:1, astro:"Libra season / Air", element:"Air", symbol:"⚔️", keywords:["clarity","breakthrough","truth","mental power"], keywordsTh:["ความชัดเจน","การก้าวข้าม","ความจริง","พลังความคิด"], upright:"ความชัดเจนและความจริงกำลังจะปรากฏ ดาบแห่งสัจธรรมตัดผ่านความสับสน ถึงเวลาพูดความจริงและใช้ปัญญาในการแก้ปัญหา", reversed:"ความสับสน ความโกลาหล หรือข้อมูลที่บิดเบือน" },
  { id:"swords-2", name:"Two of Swords", nameTh:"สองดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:2, astro:"Moon in Libra", element:"Air", symbol:"🙈", keywords:["indecision","stalemate","blocked emotions","avoidance"], keywordsTh:["การลังเล","ทางตัน","อารมณ์ที่ถูกปิดกั้น","การหลีกเลี่ยง"], upright:"ติดอยู่กับการตัดสินใจที่ยาก ทั้งสองทางมีข้อดีและข้อเสีย ถึงเวลาเปิดตาและเผชิญกับความจริง", reversed:"เริ่มตัดสินใจได้ ความสับสนคลี่คลาย หรือข้อมูลใหม่ปรากฏ" },
  { id:"swords-3", name:"Three of Swords", nameTh:"สามดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:3, astro:"Saturn in Libra", element:"Air", symbol:"💔", keywords:["heartbreak","sorrow","grief","separation"], keywordsTh:["หัวใจสลาย","ความเจ็บปวด","ความโศกเศร้า","การพลัดพราก"], upright:"ความเจ็บปวดทางใจที่รุนแรง การสูญเสีย หัวใจสลาย หรือการพลัดพรากกำลังจะผ่านไป การยอมรับความเจ็บปวดคือการรักษา", reversed:"การฟื้นตัวจากความเจ็บปวด การอภัย หรือความเศร้าที่คลี่คลาย" },
  { id:"swords-4", name:"Four of Swords", nameTh:"สี่ดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:4, astro:"Jupiter in Libra", element:"Air", symbol:"😴", keywords:["rest","recuperation","contemplation","meditation"], keywordsTh:["การพักผ่อน","การฟื้นฟู","การไตร่ตรอง","การนั่งสมาธิ"], upright:"ร่างกายและจิตใจต้องการพัก หยุดพักก่อนที่จะก้าวต่อ การไตร่ตรองในความเงียบจะนำคำตอบมาให้", reversed:"ฟื้นตัวและพร้อมลงมือทำอีกครั้ง หรือไม่ยอมพักแม้ร่างกายต้องการ" },
  { id:"swords-5", name:"Five of Swords", nameTh:"ห้าดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:5, astro:"Venus in Aquarius", element:"Air", symbol:"😤", keywords:["conflict","defeat","winning at all cost","betrayal"], keywordsTh:["ความขัดแย้ง","ความพ่ายแพ้","การชนะไม่ว่าราคาเท่าไร","การทรยศ"], upright:"มีผู้แพ้และผู้ชนะในสถานการณ์นี้ แต่การชนะด้วยวิธีที่ไม่ถูกต้องมีราคาที่ต้องจ่าย ระวังคนที่ไม่จริงใจ", reversed:"การคืนดี การยอมรับความพ่ายแพ้ หรือจบสงครามที่ไม่จำเป็น" },
  { id:"swords-6", name:"Six of Swords", nameTh:"หกดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:6, astro:"Mercury in Aquarius", element:"Air", symbol:"⛵", keywords:["transition","moving on","leaving trouble behind","healing"], keywordsTh:["การเปลี่ยนผ่าน","การก้าวไปข้างหน้า","ปล่อยวางปัญหา","การรักษา"], upright:"กำลังเดินทางจากความปั่นป่วนสู่ความสงบ ยังมีปัญหาติดตามมาบ้าง แต่ทิศทางดีขึ้น ค่อยๆ เดินหน้าต่อไป", reversed:"ยังไม่สามารถก้าวออกจากสถานการณ์เดิม หรือกลับมาเผชิญปัญหาเดิม" },
  { id:"swords-7", name:"Seven of Swords", nameTh:"เจ็ดดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:7, astro:"Moon in Aquarius", element:"Air", symbol:"🦊", keywords:["deception","strategy","betrayal","getting away with something"], keywordsTh:["การหลอกลวง","กลยุทธ์","การทรยศ","การหลบหนี"], upright:"มีการหลอกลวงหรือการทำสิ่งลับๆ ในสถานการณ์นี้ ระวังคนที่ทำสิ่งลับหลังหรือใช้กลยุทธ์ที่ไม่ตรงไปตรงมา", reversed:"สารภาพความจริง เปิดเผยการหลอกลวง หรือกลยุทธ์ที่ล้มเหลว" },
  { id:"swords-8", name:"Eight of Swords", nameTh:"แปดดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:8, astro:"Jupiter in Gemini", element:"Air", symbol:"🙎", keywords:["imprisonment","restriction","self-imposed limits","victim mentality"], keywordsTh:["การถูกจำกัด","ข้อจำกัด","กำแพงในใจ","ความรู้สึกเป็นเหยื่อ"], upright:"คุณรู้สึกติดอยู่ แต่โซ่ตรวนส่วนใหญ่อยู่ในความคิดของตัวเอง ถอดผ้าปิดตาออก คุณมีอิสระมากกว่าที่คิด", reversed:"ปลดปล่อยตัวเองจากความกลัว เห็นทางออกชัดเจนขึ้น" },
  { id:"swords-9", name:"Nine of Swords", nameTh:"เก้าดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:9, astro:"Mars in Gemini", element:"Air", symbol:"😱", keywords:["anxiety","worry","nightmares","guilt","suffering"], keywordsTh:["ความวิตกกังวล","ความกลัว","ฝันร้าย","ความรู้สึกผิด","ความทุกข์"], upright:"ความวิตกกังวลและความกลัวกำลังทรมาน ส่วนใหญ่เกิดจากความคิดมากกว่าความเป็นจริง ตื่นขึ้นมาเผชิญความกลัว ไม่ร้ายกาจอย่างที่คิด", reversed:"ออกจากความวิตกกังวลได้ แสงสว่างกำลังปรากฏ" },
  { id:"swords-10", name:"Ten of Swords", nameTh:"สิบดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:10, astro:"Sun in Gemini", element:"Air", symbol:"🌅", keywords:["endings","defeat","crisis","rock bottom","transformation"], keywordsTh:["การสิ้นสุด","ความพ่ายแพ้","วิกฤต","จุดต่ำสุด","การเปลี่ยนแปลง"], upright:"ถึงจุดต่ำสุดแล้ว แต่ดวงอาทิตย์กำลังขึ้นอยู่เบื้องหลัง หลังจากนี้จะดีขึ้นเท่านั้น วิกฤตนี้คือจุดเปลี่ยนของชีวิต", reversed:"ฟื้นตัวจากจุดต่ำสุด ค่อยๆ กลับมา หรือหลีกเลี่ยงบทเรียนที่จำเป็น" },
  { id:"swords-page", name:"Page of Swords", nameTh:"เพจดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:"Page", astro:"Earth of Air", element:"Air/Earth", symbol:"📰", keywords:["curiosity","intellect","new ideas","vigilance"], keywordsTh:["ความอยากรู้","ปัญญา","ความคิดใหม่","ความตื่นตัว"], upright:"ข่าวหรือความคิดใหม่กำลังจะมา ความกระตือรือร้นทางความคิด หรือคนหนุ่มสาวที่ฉลาดและตรงไปตรงมา", reversed:"ข่าวร้าย การนินทา หรือความคิดที่ไม่สุกงอม" },
  { id:"swords-knight", name:"Knight of Swords", nameTh:"อัศวินดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:"Knight", astro:"Fire of Air", element:"Air/Fire", symbol:"⚡", keywords:["action","ambition","driven","determination"], keywordsTh:["การลงมือ","ความทะเยอทะยาน","ความมุ่งมั่น","การตัดสินใจเร็ว"], upright:"พลังงานแห่งการกระทำที่รวดเร็วและเด็ดขาด ถึงเวลาลงมือทำโดยไม่ลังเล", reversed:"หุนหันพลันแล่น ก้าวร้าว หรือพลังงานที่ไร้ทิศทาง" },
  { id:"swords-queen", name:"Queen of Swords", nameTh:"ราชินีดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:"Queen", astro:"Water of Air", element:"Air/Water", symbol:"👑", keywords:["independence","unbiased judgement","clear thinking","direct communication"], keywordsTh:["ความเป็นอิสระ","การตัดสินที่ยุติธรรม","ความคิดชัดเจน","การสื่อสารตรงไปตรงมา"], upright:"ตัดสินใจด้วยสติและความยุติธรรม ไม่ถูกครอบงำด้วยอารมณ์ คนที่ฉลาดและตรงไปตรงมากำลังเข้ามาช่วย", reversed:"ความเย็นชา การตัดสินที่รุนแรง หรือความขมขื่น" },
  { id:"swords-king", name:"King of Swords", nameTh:"กษัตริย์ดาบ", arcana:"minor", suit:"swords", suitTh:"ดาบ", rank:"King", astro:"Air of Air", element:"Air", symbol:"⚖️", keywords:["intellectual power","authority","truth","discipline"], keywordsTh:["พลังปัญญา","อำนาจ","ความจริง","วินัย"], upright:"ผู้นำที่ใช้ปัญญาและความยุติธรรม กฎหมาย ระบบ และผู้มีอำนาจกำลังเข้ามาเกี่ยวข้องในทางที่เป็นประโยชน์", reversed:"การใช้อำนาจในทางที่ผิด เผด็จการทางความคิด หรือการตัดสินที่ไม่ยุติธรรม" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MINOR ARCANA — PENTACLES (Earth / Taurus, Virgo, Capricorn)
// ─────────────────────────────────────────────────────────────────────────────
const PENTACLES: TarotCard[] = [
  { id:"pents-1", name:"Ace of Pentacles", nameTh:"เอซเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:1, astro:"Taurus season / Earth", element:"Earth", symbol:"💰", keywords:["opportunity","prosperity","new beginnings","abundance"], keywordsTh:["โอกาส","ความมั่งคั่ง","จุดเริ่มต้น","ความอุดมสมบูรณ์"], upright:"โอกาสทางการเงินหรือวัตถุกำลังจะมา เมล็ดพันธุ์แห่งความมั่งคั่งกำลังถูกหว่าน โปรเจกต์ใหม่ที่จะสร้างรายได้มั่นคง", reversed:"โอกาสที่หลุดไป การวางแผนการเงินที่ผิดพลาด หรือความโลภ" },
  { id:"pents-2", name:"Two of Pentacles", nameTh:"สองเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:2, astro:"Jupiter in Capricorn", element:"Earth", symbol:"🤹", keywords:["balance","adaptability","multitasking","time management"], keywordsTh:["สมดุล","การปรับตัว","การทำหลายอย่างพร้อมกัน","การบริหารเวลา"], upright:"กำลังจัดการหลายสิ่งพร้อมกัน ต้องการความยืดหยุ่นและสมดุล จัดลำดับความสำคัญให้ดี", reversed:"ไม่สามารถจัดการทุกอย่างพร้อมกันได้ ขาดสมดุล หรือการเงินที่ไม่มั่นคง" },
  { id:"pents-3", name:"Three of Pentacles", nameTh:"สามเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:3, astro:"Mars in Capricorn", element:"Earth", symbol:"🏗️", keywords:["teamwork","learning","mastery","collaboration"], keywordsTh:["การทำงานร่วมกัน","การเรียนรู้","ความเชี่ยวชาญ","ความร่วมมือ"], upright:"การทำงานร่วมกันเป็นทีมจะนำสู่ความสำเร็จ ทักษะและความเชี่ยวชาญกำลังได้รับการยอมรับ", reversed:"ขาดการทำงานเป็นทีม ไม่เรียนรู้จากผู้อื่น หรืองานฝีมือที่ไม่ได้มาตรฐาน" },
  { id:"pents-4", name:"Four of Pentacles", nameTh:"สี่เหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:4, astro:"Sun in Capricorn", element:"Earth", symbol:"💼", keywords:["security","control","conservatism","scarcity"], keywordsTh:["ความปลอดภัย","การควบคุม","ความประหยัด","ความขาดแคลน"], upright:"การรักษาความมั่นคงทางการเงิน แต่อาจกำลังยึดมั่นกับทรัพย์สินมากเกินไปจนปิดกั้นการเติบโต", reversed:"ปล่อยวางความโลภ เปิดรับความอุดมสมบูรณ์ หรือการสูญเสียที่กลัวอยู่" },
  { id:"pents-5", name:"Five of Pentacles", nameTh:"ห้าเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:5, astro:"Mercury in Taurus", element:"Earth", symbol:"❄️", keywords:["financial loss","poverty","insecurity","worry"], keywordsTh:["การสูญเสียทางการเงิน","ความยากจน","ความไม่มั่นคง","ความกังวล"], upright:"ความยากลำบากทางการเงินหรือวัตถุ แต่ความช่วยเหลือมีอยู่ใกล้ๆ ถ้าหยุดมัวแต่จมกับปัญหา", reversed:"สภาวะการเงินดีขึ้น ผ่านพ้นยุคยาก หรือได้รับความช่วยเหลือ" },
  { id:"pents-6", name:"Six of Pentacles", nameTh:"หกเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:6, astro:"Moon in Taurus", element:"Earth", symbol:"🤝", keywords:["generosity","charity","giving","receiving"], keywordsTh:["ความใจกว้าง","การให้","การรับ","ความสมดุลทางวัตถุ"], upright:"พลังงานแห่งการให้และรับอย่างสมดุล อาจได้รับความช่วยเหลือทางการเงิน หรือถึงเวลาแบ่งปันความมั่งคั่ง", reversed:"ให้โดยมีเงื่อนไข รับโดยไม่รู้สึกขอบคุณ หรือความไม่สมดุลในการแลกเปลี่ยน" },
  { id:"pents-7", name:"Seven of Pentacles", nameTh:"เจ็ดเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:7, astro:"Saturn in Taurus", element:"Earth", symbol:"🌱", keywords:["long-term vision","sustainable results","perseverance","investment"], keywordsTh:["วิสัยทัศน์ระยะยาว","ผลที่ยั่งยืน","ความอดทน","การลงทุน"], upright:"ผลจากการลงทุนและความพยายามกำลังจะปรากฏ อดทนรออีกนิด สิ่งที่ปลูกไว้กำลังจะงอกงาม", reversed:"ผลตอบแทนที่ไม่คุ้มค่า ความไม่พอใจกับสิ่งที่สร้างมา หรือขาดแรงบันดาลใจ" },
  { id:"pents-8", name:"Eight of Pentacles", nameTh:"แปดเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:8, astro:"Sun in Virgo", element:"Earth", symbol:"⚒️", keywords:["apprenticeship","skill development","dedication","mastery"], keywordsTh:["การฝึกฝน","การพัฒนาทักษะ","ความทุ่มเท","ความเชี่ยวชาญ"], upright:"เวลาแห่งการฝึกฝนทักษะอย่างทุ่มเท ความพยายามที่ต่อเนื่องจะนำสู่ความเชี่ยวชาญ คุณภาพเหนือปริมาณ", reversed:"งานที่ไม่มีคุณภาพ ขาดความทุ่มเท หรือวนซ้ำงานประจำโดยไม่พัฒนา" },
  { id:"pents-9", name:"Nine of Pentacles", nameTh:"เก้าเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:9, astro:"Venus in Virgo", element:"Earth", symbol:"🌿", keywords:["luxury","self-reliance","financial independence","refinement"], keywordsTh:["ความหรูหรา","การพึ่งตนเอง","อิสรภาพทางการเงิน","ความประณีต"], upright:"คุณกำลังจะได้เสวยสุขจากผลของการทำงานหนัก ความมั่งคั่งและความเป็นอิสระทางการเงินกำลังจะมาถึง", reversed:"พึ่งพาผู้อื่นมากเกินไป ความหรูหราที่เกินตัว หรือความสำเร็จที่ยังขาดอยู่" },
  { id:"pents-10", name:"Ten of Pentacles", nameTh:"สิบเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:10, astro:"Mercury in Virgo", element:"Earth", symbol:"🏡", keywords:["wealth","inheritance","family legacy","long-term success"], keywordsTh:["ความมั่งคั่ง","มรดก","มรดกครอบครัว","ความสำเร็จระยะยาว"], upright:"ความสำเร็จสูงสุดทางวัตถุและครอบครัว มรดกและความมั่งคั่งที่ส่งต่อได้ สร้างรากฐานที่แข็งแกร่งสำหรับคนรุ่นต่อไป", reversed:"ปัญหาครอบครัวที่เกี่ยวกับเงิน ทะเลาะเรื่องมรดก หรือความสำเร็จที่มีราคาต้องจ่าย" },
  { id:"pents-page", name:"Page of Pentacles", nameTh:"เพจเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:"Page", astro:"Earth of Earth", element:"Earth", symbol:"📚", keywords:["manifestation","diligence","opportunity","new venture"], keywordsTh:["การสร้างสรรค์","ความขยัน","โอกาส","กิจการใหม่"], upright:"โอกาสใหม่ทางวัตถุหรือการเงินกำลังจะมา ถึงเวลาเรียนรู้ทักษะใหม่ที่จะสร้างรายได้", reversed:"ขาดความมุ่งมั่น โอกาสที่หลุดไป หรือความฝันที่ไม่มีแผน" },
  { id:"pents-knight", name:"Knight of Pentacles", nameTh:"อัศวินเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:"Knight", astro:"Fire of Earth", element:"Earth/Fire", symbol:"🐂", keywords:["efficiency","routine","conservatism","hard work"], keywordsTh:["ประสิทธิภาพ","ความสม่ำเสมอ","ความรอบคอบ","การทำงานหนัก"], upright:"ทำงานอย่างมีระเบียบและสม่ำเสมอ ความอดทนและความพยายามจะนำสู่ผลลัพธ์ที่มั่นคง", reversed:"ความเฉื่อยชา ติดอยู่กับกิจวัตรเดิม หรือขาดแรงบันดาลใจ" },
  { id:"pents-queen", name:"Queen of Pentacles", nameTh:"ราชินีเหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:"Queen", astro:"Water of Earth", element:"Earth/Water", symbol:"🌺", keywords:["nurturing","practical","providing","down-to-earth"], keywordsTh:["การดูแล","ความเป็นจริง","การจัดหา","ความมีเหตุผล"], upright:"พลังงานแห่งความอบอุ่นและความมั่นคงทางวัตถุ ดูแลตัวเองและคนรอบข้างในทางที่เป็นจริง", reversed:"ขาดความสมดุลระหว่างงานและชีวิต ความวุ่นวายในบ้าน หรือขาดความมั่นคง" },
  { id:"pents-king", name:"King of Pentacles", nameTh:"กษัตริย์เหรียญ", arcana:"minor", suit:"pentacles", suitTh:"เหรียญ", rank:"King", astro:"Air of Earth", element:"Earth/Air", symbol:"💎", keywords:["wealth","business","leadership","security","discipline"], keywordsTh:["ความมั่งคั่ง","ธุรกิจ","ความเป็นผู้นำ","ความมั่นคง","วินัย"], upright:"ผู้นำที่ประสบความสำเร็จทางธุรกิจและการเงิน มีคนที่มั่งคั่งและมีอิทธิพลช่วยเหลือ หรือถึงเวลาแสดงความเป็นผู้นำทางธุรกิจ", reversed:"การทุจริต ความโลภ หรือความสำเร็จที่ขาดความซื่อสัตย์" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Full deck
// ─────────────────────────────────────────────────────────────────────────────
export const TAROT_DECK: TarotCard[] = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES,
];

// ─────────────────────────────────────────────────────────────────────────────
// Draw Celtic Cross — 10 cards, some reversed (40% chance)
// ─────────────────────────────────────────────────────────────────────────────
export function drawCelticCross(): CelticCrossSpread {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, 10).map(card => ({
    ...card,
    isReversed: Math.random() < 0.40,
  }));
  return { cards: drawn, positions: CELTIC_CROSS_POSITIONS };
}

// Format spread for AI prompt
export function formatSpreadForPrompt(spread: CelticCrossSpread): string {
  return spread.cards.map((card, i) => {
    const pos = CELTIC_CROSS_POSITIONS[i];
    const orientation = card.isReversed ? "กลับหัว (Reversed)" : "ตรง (Upright)";
    const meaning = card.isReversed ? card.reversed : card.upright;
    return `ตำแหน่ง ${pos.id}: ${pos.nameTh} (${pos.name})
ไพ่: ${card.nameTh} (${card.name}) — ${orientation}
ดาว/ธาตุ: ${card.astro}
คำสำคัญ: ${card.keywordsTh.join(", ")}
ความหมาย: ${meaning}`;
  }).join("\n\n");
}
