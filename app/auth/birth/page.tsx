"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { IconGalaxy } from "@/components/AstraIcons";
import { getZodiacSign } from "@/lib/zodiac";
import { useRouter } from "next/navigation";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS    = Array.from({length:31}, (_,i) => i+1);
const YEARS_BE = Array.from({length:90}, (_,i) => 2568-i);
const HOURS   = Array.from({length:24}, (_,i) => i);
const MINUTES = Array.from({length:60}, (_,i) => i);
const PROVINCES = [
  { name:"กรุงเทพมหานคร", lat:13.7563, lon:100.5018 },
  { name:"กระบี่",        lat:8.0863,  lon:98.9063  },
  { name:"กาญจนบุรี",     lat:14.0228, lon:99.5328  },
  { name:"กาฬสินธุ์",     lat:16.4322, lon:103.5066 },
  { name:"กำแพงเพชร",     lat:16.4828, lon:99.5227  },
  { name:"ขอนแก่น",       lat:16.4419, lon:102.835  },
  { name:"จันทบุรี",      lat:12.6113, lon:102.1038 },
  { name:"ฉะเชิงเทรา",    lat:13.6904, lon:101.0779 },
  { name:"ชลบุรี",        lat:13.3611, lon:100.9847 },
  { name:"ชัยนาท",        lat:15.1852, lon:100.1251 },
  { name:"ชัยภูมิ",       lat:15.8068, lon:102.0315 },
  { name:"ชุมพร",         lat:10.493,  lon:99.18    },
  { name:"เชียงราย",      lat:19.9105, lon:99.8406  },
  { name:"เชียงใหม่",     lat:18.7883, lon:98.9853  },
  { name:"ตรัง",          lat:7.5594,  lon:99.6114  },
  { name:"ตราด",          lat:12.2428, lon:102.5175 },
  { name:"ตาก",           lat:16.8838, lon:99.1258  },
  { name:"นครนายก",       lat:14.2069, lon:101.2131 },
  { name:"นครปฐม",        lat:13.8199, lon:100.0622 },
  { name:"นครพนม",        lat:17.392,  lon:104.7696 },
  { name:"นครราชสีมา",    lat:14.9799, lon:102.0977 },
  { name:"นครศรีธรรมราช", lat:8.4304,  lon:99.9631  },
  { name:"นครสวรรค์",     lat:15.7047, lon:100.1372 },
  { name:"นนทบุรี",       lat:13.8621, lon:100.5144 },
  { name:"นราธิวาส",      lat:6.4255,  lon:101.8253 },
  { name:"น่าน",          lat:18.7756, lon:100.773  },
  { name:"บึงกาฬ",        lat:18.3609, lon:103.6466 },
  { name:"บุรีรัมย์",     lat:14.993,  lon:103.1029 },
  { name:"ปทุมธานี",      lat:14.0208, lon:100.525  },
  { name:"ประจวบคีรีขันธ์",lat:11.8124,lon:99.7973  },
  { name:"ปราจีนบุรี",    lat:14.05,   lon:101.372  },
  { name:"ปัตตานี",       lat:6.8695,  lon:101.2505 },
  { name:"พระนครศรีอยุธยา",lat:14.3532,lon:100.5689 },
  { name:"พะเยา",         lat:19.1665, lon:99.9019  },
  { name:"พังงา",         lat:8.4501,  lon:98.5255  },
  { name:"พัทลุง",        lat:7.6167,  lon:100.074  },
  { name:"พิจิตร",        lat:16.4418, lon:100.3488 },
  { name:"พิษณุโลก",      lat:16.8211, lon:100.2659 },
  { name:"เพชรบุรี",      lat:13.1112, lon:99.939   },
  { name:"เพชรบูรณ์",     lat:16.419,  lon:101.1606 },
  { name:"แพร่",          lat:18.1446, lon:100.1403 },
  { name:"ภูเก็ต",        lat:7.8804,  lon:98.3923  },
  { name:"มหาสารคาม",     lat:16.1848, lon:103.3007 },
  { name:"มุกดาหาร",      lat:16.5422, lon:104.7209 },
  { name:"แม่ฮ่องสอน",    lat:19.301,  lon:97.9654  },
  { name:"ยโสธร",         lat:15.7926, lon:104.1453 },
  { name:"ยะลา",          lat:6.5411,  lon:101.2804 },
  { name:"ร้อยเอ็ด",      lat:16.0538, lon:103.652  },
  { name:"ระนอง",         lat:9.9529,  lon:98.6085  },
  { name:"ระยอง",         lat:12.6814, lon:101.2816 },
  { name:"ราชบุรี",       lat:13.5283, lon:99.8134  },
  { name:"ลพบุรี",        lat:14.7995, lon:100.6534 },
  { name:"ลำปาง",         lat:18.2888, lon:99.4909  },
  { name:"ลำพูน",         lat:18.5745, lon:99.0087  },
  { name:"เลย",           lat:17.486,  lon:101.7223 },
  { name:"ศรีสะเกษ",      lat:15.1186, lon:104.322  },
  { name:"สกลนคร",        lat:17.1546, lon:104.1348 },
  { name:"สงขลา",         lat:7.1898,  lon:100.5951 },
  { name:"สตูล",          lat:6.6238,  lon:100.0674 },
  { name:"สมุทรปราการ",   lat:13.5991, lon:100.5998 },
  { name:"สมุทรสงคราม",   lat:13.4098, lon:100.0023 },
  { name:"สมุทรสาคร",     lat:13.5475, lon:100.2744 },
  { name:"สระแก้ว",       lat:13.824,  lon:102.0646 },
  { name:"สระบุรี",       lat:14.5289, lon:100.9101 },
  { name:"สิงห์บุรี",     lat:14.8936, lon:100.3967 },
  { name:"สุโขทัย",       lat:17.0056, lon:99.8264  },
  { name:"สุพรรณบุรี",    lat:14.4745, lon:100.1177 },
  { name:"สุราษฎร์ธานี",  lat:9.1382,  lon:99.3215  },
  { name:"สุรินทร์",      lat:14.8829, lon:103.4937 },
  { name:"หนองคาย",       lat:17.8783, lon:102.7413 },
  { name:"หนองบัวลำภู",   lat:17.2218, lon:102.426  },
  { name:"อ่างทอง",       lat:14.5896, lon:100.4551 },
  { name:"อำนาจเจริญ",    lat:15.8585, lon:104.6288 },
  { name:"อุดรธานี",      lat:17.4138, lon:102.7872 },
  { name:"อุตรดิตถ์",     lat:17.6201, lon:100.0993 },
  { name:"อุทัยธานี",     lat:15.3835, lon:100.0246 },
  { name:"อุบลราชธานี",   lat:15.2287, lon:104.8564 },
];

export default function BirthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [yearBE,  setYearBE]  = useState("");
  const [month,   setMonth]   = useState("");
  const [day,     setDay]     = useState("");
  const [hour,    setHour]    = useState("");
  const [minute,  setMinute]  = useState("0");
  const [province, setProvince] = useState("กรุงเทพมหานคร");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      // ถ้ามีข้อมูลเกิดแล้ว ไม่ต้องกรอกซ้ำ
      if (data.session.user.user_metadata?.birth_year_be) {
        router.push("/"); return;
      }
      const name = data.session.user.user_metadata?.full_name ||
                   data.session.user.user_metadata?.display_name ||
                   data.session.user.email?.split("@")[0] || "";
      setUserName(name);
    });
  }, []);

  const canSave = yearBE && month && day && hour !== "";

  async function save() {
    if (!canSave) return;
    setLoading(true); setError("");
    try {
      // Ensure session is available (may need refresh after OAuth callback)
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session;
      }
      if (!session) {
        setError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        setLoading(false);
        setTimeout(() => router.push("/auth"), 2000);
        return;
      }

      const ce = Number(yearBE) - 543;
      const birthDate = `${ce}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const birthTime = `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
      const prov = PROVINCES.find(p => p.name === province) || PROVINCES[0];
      const zodiac = getZodiacSign(Number(month), Number(day));

      const { error: err } = await supabase.auth.updateUser({
        data: {
          birth_date: birthDate, birth_time: birthTime,
          birth_year_be: Number(yearBE), birth_month: Number(month),
          birth_day: Number(day), birth_hour: Number(hour),
          birth_minute: Number(minute), province,
          latitude: prov.lat, longitude: prov.lon,
          zodiac_sign: zodiac,
        }
      });
      if (err) throw err;
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  return (
    <main className="premium-shell auth-page">
      <div className="grain" />
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <a href="/" className="brand-lockup" style={{ textDecoration:"none", justifyContent:"center" }}>
            <span className="brand-sigil">✦</span>
            <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
          </a>
        </div>

        <div className="auth-birth-header">
          <span><IconGalaxy size={36}/></span>
          <h3>สวัสดี{userName ? ` คุณ${userName}` : ""}!</h3>
          <p>กรอกข้อมูลเกิดเพื่อสร้างแผนที่ดวงส่วนตัว<br/>ระบบจะจดจำให้ ไม่ต้องกรอกซ้ำอีก</p>
        </div>

        <div className="auth-birth-form">
          <div className="auth-birth-row">
            <label className="lux-field">
              <span>วัน</span>
              <select value={day} onChange={e => setDay(e.target.value)}>
                <option value="">วัน</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="lux-field">
              <span>เดือน</span>
              <select value={month} onChange={e => setMonth(e.target.value)}>
                <option value="">เดือน</option>
                {MONTHS_TH.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </label>
            <label className="lux-field">
              <span>ปี พ.ศ.</span>
              <select value={yearBE} onChange={e => setYearBE(e.target.value)}>
                <option value="">ปี</option>
                {YEARS_BE.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>

          <div className="auth-birth-row" style={{ gridTemplateColumns:"1fr 1fr" }}>
            <label className="lux-field">
              <span>ชั่วโมงเกิด</span>
              <select value={hour} onChange={e => setHour(e.target.value)}>
                <option value="">ชั่วโมง</option>
                {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,"0")} น.</option>)}
              </select>
            </label>
            <label className="lux-field">
              <span>นาทีเกิด</span>
              <select value={minute} onChange={e => setMinute(e.target.value)}>
                {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
              </select>
            </label>
          </div>

          <label className="lux-field">
            <span>จังหวัดที่เกิด</span>
            <select value={province} onChange={e => setProvince(e.target.value)}>
              {PROVINCES.map(p => <option key={p.name}>{p.name}</option>)}
            </select>
            <small>ถ้าจังหวัดไม่มีในรายการ เลือกจังหวัดที่ใกล้ที่สุด</small>
          </label>
        </div>

        {error && <div className="auth-message err" style={{ marginTop:12 }}>{error}</div>}

        <button
          className="luxury-button auth-submit"
          style={{ marginTop:20 }}
          onClick={save}
          disabled={!canSave || loading}
        >
          {loading ? "กำลังบันทึก…" : "บันทึกข้อมูลเกิด →"}
        </button>

        <button
          className="auth-link"
          style={{ marginTop:10, display:"block", textAlign:"center" }}
          onClick={() => router.push("/")}
        >
          ข้ามไปก่อน (กรอกภายหลังได้)
        </button>
      </div>
    </main>
  );
}
