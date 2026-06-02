"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getZodiacSign } from "@/lib/zodiac";
import { useRouter } from "next/navigation";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS    = Array.from({length:31}, (_,i) => i+1);
const YEARS_BE = Array.from({length:90}, (_,i) => 2568-i);
const HOURS   = Array.from({length:24}, (_,i) => i);
const MINUTES = Array.from({length:60}, (_,i) => i);
const PROVINCES = [
  { name:"กรุงเทพมหานคร", lat:13.7563, lon:100.5018 },
  { name:"เชียงใหม่",     lat:18.7883, lon:98.9853  },
  { name:"ภูเก็ต",        lat:7.8804,  lon:98.3923  },
  { name:"ขอนแก่น",       lat:16.4419, lon:102.835  },
  { name:"นครราชสีมา",    lat:14.9799, lon:102.0977 },
  { name:"สงขลา",         lat:7.1898,  lon:100.5951 },
  { name:"ชลบุรี",        lat:13.3611, lon:100.9847 },
  { name:"อุดรธานี",      lat:17.4138, lon:102.7872 },
  { name:"นนทบุรี",       lat:13.8621, lon:100.5144 },
  { name:"สุราษฎร์ธานี",  lat:9.1382,  lon:99.3215  },
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
          <span>🌌</span>
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
