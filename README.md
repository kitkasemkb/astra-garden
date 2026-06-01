# AI Astrology Advisor — V7.3 Mobile Simple UX

เวอร์ชันนี้ต่อจาก V7.2 โดยปรับ UX สำหรับมือถือให้เรียบง่ายขึ้น อ่านง่ายขึ้น และลดความรู้สึกว่าเป็นฟอร์มยาว พร้อมลบตัวเลือกพิเศษ “อรัญประเทศ / รพ.อรัญประเทศ” ออกจากรายการจังหวัดเกิดแบบเร็วแล้ว

# AI Astrology Advisor V6 — Production Ephemeris

เวอร์ชันนี้เปลี่ยนชั้นคำนวณดวงจากสูตรประมาณการเดิมมาใช้ `sweph` ซึ่งเป็น Node.js binding ของ Swiss Ephemeris สำหรับคำนวณตำแหน่งดาว ลัคนา MC เรือน และ aspect ในฝั่ง server-side

## Quick start

```bash
npm install
npm run dev
```

สร้างไฟล์ `.env.local` จาก `.env.example`

```env
OPENAI_API_KEY=ใส่_api_key_ของคุณ
OPENAI_MODEL=gpt-4.1-mini
EPHEMERIS_MODE=MOSHIER
SWISS_EPHEMERIS_PATH=./ephe
HOUSE_SYSTEM=P
STRICT_EPHEMERIS=false
ALLOW_MOSHIER_FALLBACK=true
```

เปิด `http://localhost:3000`

## ใช้โหมด Swiss Ephemeris เต็มรูปแบบ

1. ดาวน์โหลดไฟล์ ephemeris `.se1` จากแหล่งทางการของ Swiss Ephemeris/Astrodienst
2. วางไฟล์ไว้ในโฟลเดอร์ `ephe/` ของโปรเจกต์ เช่น `sepl_18.se1`, `semo_18.se1` สำหรับช่วง ค.ศ. 1800–2400
3. เปลี่ยน `.env.local` เป็น

```env
EPHEMERIS_MODE=SWISS
SWISS_EPHEMERIS_PATH=./ephe
STRICT_EPHEMERIS=true
ALLOW_MOSHIER_FALLBACK=false
```

## หมายเหตุด้าน License สำหรับเชิงพาณิชย์

Swiss Ephemeris เป็นซอฟต์แวร์แบบ dual-license คือ AGPL หรือ Swiss Ephemeris Professional License สำหรับโครงการเชิงพาณิชย์ที่ไม่ต้องการเปิดซอร์สทั้งระบบ ควรตรวจสอบและจัดซื้อ professional license จาก Astrodienst ก่อนเปิดบริการจริง

## House system

ค่าเริ่มต้นใช้ Placidus (`HOUSE_SYSTEM=P`) สามารถเปลี่ยนได้ภายหลัง เช่น Equal, Whole Sign หรือระบบอื่นตามที่ Swiss Ephemeris รองรับ

## สิ่งที่เปลี่ยนจาก V5

- ใช้ Swiss Ephemeris binding แทนสูตร orbital approximation เดิม
- API route เปลี่ยนเป็น async chart calculation
- เพิ่ม metadata ใน chart: ephemeris engine, ephemeris mode, house system, house cusps
- รองรับโหมด Moshier สำหรับ deploy ง่าย และโหมด Swiss data files สำหรับ production precision


## V7 UX update

เวอร์ชันนี้ปรับ UX/UI เป็นแนว Astral Garden: soft premium, content-hub, pastel editorial, rounded cards และ landing page ที่ให้ความรู้สึกอบอุ่นผ่อนคลายมากขึ้น โดยได้รับแรงบันดาลใจจากเว็บไซต์ astrology content hub ระดับสากล แต่ไม่ได้คัดลอกแบรนด์หรือ asset ของเว็บไซต์ใดโดยตรง

สิ่งที่เพิ่ม:
- Landing hero โทน pastel mystical
- Decorative zodiac wheel และ floating celestial elements
- Learning strip 3 card สำหรับอธิบายบริการก่อนเริ่มใช้งาน
- ปรับสี spacing border radius shadow ให้ดู friendly premium มากขึ้น
- ยังคง Swiss Ephemeris production-ready layer จาก V6


## V7.1 Native sweph loading fix

รอบนี้เพิ่มการบังคับ API route ให้รันบน Node.js runtime, externalize native package `sweph`, และปรับ `npm run dev` เป็น `next dev --webpack` เพื่อลดปัญหา Turbopack/Native addon บนเครื่อง local โดยเฉพาะ Windows.

ถ้ายังขึ้น error ให้รันคำสั่งตรวจสอบ:

```bash
npm ls sweph
node -e "const sweph=require('sweph'); console.log(Object.keys(sweph).slice(0,20))"
```

ถ้าคำสั่ง node ด้านบน error แปลว่าเป็นปัญหาการติดตั้ง/native build ของ `sweph` ไม่ใช่โค้ด Next.js.
