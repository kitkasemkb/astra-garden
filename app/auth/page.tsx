"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getZodiacSign } from "@/lib/zodiac";
import { useRouter } from "next/navigation";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS = Array.from({length:31},(_,i)=>i+1);
const YEARS_BE = Array.from({length:90},(_,i)=>2568-i);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = Array.from({length:60},(_,i)=>i);

const PROVINCES = [
  { name:"กรุงเทพมหานคร", lat:13.7563, lon:100.5018 },
  { name:"เชียงใหม่", lat:18.7883, lon:98.9853 },
  { name:"ภูเก็ต", lat:7.8804, lon:98.3923 },
  { name:"ขอนแก่น", lat:16.4419, lon:102.835 },
  { name:"นครราชสีมา", lat:14.9799, lon:102.0977 },
  { name:"สงขลา", lat:7.1898, lon:100.5951 },
  { name:"ชลบุรี", lat:13.3611, lon:100.9847 },
  { name:"อุดรธานี", lat:17.4138, lon:102.7872 },
  { name:"นนทบุรี", lat:13.8621, lon:100.5144 },
  { name:"สุราษฎร์ธานี", lat:9.1382, lon:99.3215 },
];

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login"|"signup"|"forgot"|"birth">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text:string;ok:boolean}|null>(null);

  // Birth data
  const [yearBE, setYearBE] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [province, setProvince] = useState("กรุงเทพมหานคร");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
        if (error) throw error;
        setMode("birth"); // ไปกรอกข้อมูลเกิดต่อ
        setMessage({ text: "สมัครสำเร็จ! กรอกข้อมูลเกิดเพื่อสร้างแผนที่ดวงของคุณ", ok: true });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
        if (error) throw error;
        setMessage({ text: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", ok: true });
      } else if (mode === "birth") {
        await saveBirthData();
      }
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : "เกิดข้อผิดพลาด", ok: false });
    } finally {
      setLoading(false);
    }
  }

  async function saveBirthData() {
    if (!yearBE || !month || !day || hour === "") {
      setMessage({ text: "กรุณากรอกข้อมูลเกิดให้ครบ", ok: false });
      return;
    }
    const ce = Number(yearBE) - 543;
    const birthDate = `${ce}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const birthTime = `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
    const prov = PROVINCES.find(p => p.name === province) || PROVINCES[0];
    const zodiac = getZodiacSign(Number(month), Number(day));

    const { error } = await supabase.auth.updateUser({
      data: {
        birth_date: birthDate,
        birth_time: birthTime,
        birth_year_be: Number(yearBE),
        birth_month: Number(month),
        birth_day: Number(day),
        birth_hour: Number(hour),
        birth_minute: Number(minute),
        province: province,
        latitude: prov.lat,
        longitude: prov.lon,
        zodiac_sign: zodiac,
      }
    });
    if (error) throw error;
    router.push("/");
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setMessage({ text: error.message, ok: false }); setLoading(false); }
  }

  const canSaveBirth = yearBE && month && day && hour !== "";

  return (
    <main className="premium-shell auth-page">
      <div className="grain" />
      <div className="auth-card">
        <div className="auth-header">
          <a href="/" className="brand-lockup" style={{ textDecoration:"none", justifyContent:"center" }}>
            <span className="brand-sigil">✦</span>
            <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
          </a>
        </div>

        {mode !== "birth" && (
          <div className="auth-tabs">
            <button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>เข้าสู่ระบบ</button>
            <button className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>สมัครสมาชิก</button>
          </div>
        )}

        {mode === "birth" && (
          <div className="auth-birth-header">
            <span style={{fontSize:32}}>🌌</span>
            <h3>ข้อมูลเกิดของคุณ</h3>
            <p>ระบบจะสร้างแผนที่ดวงส่วนตัว และจดจำไว้ให้ ไม่ต้องกรอกซ้ำอีก</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label className="lux-field">
              <span>ชื่อที่แสดง</span>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อของคุณ" required />
            </label>
          )}
          {(mode === "login" || mode === "signup" || mode === "forgot") && (
            <label className="lux-field">
              <span>อีเมล</span>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required />
            </label>
          )}
          {(mode === "login" || mode === "signup") && (
            <label className="lux-field">
              <span>รหัสผ่าน</span>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </label>
          )}

          {/* Birth data form */}
          {mode === "birth" && (
            <div className="auth-birth-form">
              <div className="auth-birth-row">
                <label className="lux-field">
                  <span>วัน</span>
                  <select value={day} onChange={e=>setDay(e.target.value)} required>
                    <option value="">วัน</option>
                    {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="lux-field">
                  <span>เดือน</span>
                  <select value={month} onChange={e=>setMonth(e.target.value)} required>
                    <option value="">เดือน</option>
                    {MONTHS_TH.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                  </select>
                </label>
                <label className="lux-field">
                  <span>ปี พ.ศ.</span>
                  <select value={yearBE} onChange={e=>setYearBE(e.target.value)} required>
                    <option value="">ปี</option>
                    {YEARS_BE.map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
              </div>
              <div className="auth-birth-row" style={{gridTemplateColumns:"1fr 1fr"}}>
                <label className="lux-field">
                  <span>ชั่วโมงเกิด</span>
                  <select value={hour} onChange={e=>setHour(e.target.value)} required>
                    <option value="">ชั่วโมง</option>
                    {HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,"0")} น.</option>)}
                  </select>
                </label>
                <label className="lux-field">
                  <span>นาทีเกิด</span>
                  <select value={minute} onChange={e=>setMinute(e.target.value)}>
                    {MINUTES.map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                  </select>
                </label>
              </div>
              <label className="lux-field">
                <span>จังหวัดที่เกิด</span>
                <select value={province} onChange={e=>setProvince(e.target.value)}>
                  {PROVINCES.map(p=><option key={p.name}>{p.name}</option>)}
                </select>
                <small>ถ้าจังหวัดไม่มีในรายการ เลือกจังหวัดที่ใกล้ที่สุด</small>
              </label>
            </div>
          )}

          {message && <div className={`auth-message ${message.ok?"ok":"err"}`}>{message.text}</div>}

          <button type="submit" className="luxury-button auth-submit" disabled={loading || (mode==="birth" && !canSaveBirth)}>
            {loading ? "กำลังดำเนินการ…" :
             mode==="login" ? "เข้าสู่ระบบ" :
             mode==="signup" ? "สมัครสมาชิก" :
             mode==="birth" ? "บันทึกข้อมูลเกิด →" :
             "ส่งลิงก์รีเซ็ต"}
          </button>

          {mode === "birth" && (
            <button type="button" className="auth-link" onClick={()=>router.push("/")}>
              ข้ามไปก่อน (กรอกภายหลังได้)
            </button>
          )}
          {mode === "login" && (
            <button type="button" className="auth-link" onClick={()=>setMode("forgot")}>ลืมรหัสผ่าน?</button>
          )}
        </form>

        {mode !== "birth" && (
          <>
            <div className="auth-divider"><span>หรือ</span></div>
            <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              เข้าสู่ระบบด้วย Google
            </button>
          </>
        )}
      </div>
    </main>
  );
}
