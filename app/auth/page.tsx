"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getZodiacSign } from "@/lib/zodiac";
import { useRouter } from "next/navigation";

function isInAppBrowser() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /Line\/|FBAN\/|FBAV\/|Instagram|Twitter\/|Snapchat|MicroMessenger/i.test(ua);
}

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS = Array.from({length:31},(_,i)=>i+1);
const YEARS_BE = Array.from({length:90},(_,i)=>2568-i);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = Array.from({length:60},(_,i)=>i);

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

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login"|"signup"|"forgot"|"birth">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text:string;ok:boolean}|null>(null);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
  }, []);

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
            {inAppBrowser ? (
              <div className="auth-message err" style={{ textAlign:"center", lineHeight:1.6 }}>
                <strong>ไม่สามารถเข้าสู่ระบบด้วย Google ได้</strong><br/>
                เนื่องจากเปิดจากแอป LINE / Facebook หรือ browser ภายในแอป<br/>
                <br/>
                กรุณาคัดลอก URL แล้วเปิดใน <strong>Safari</strong> หรือ <strong>Chrome</strong> แทน
              </div>
            ) : (
              <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                เข้าสู่ระบบด้วย Google
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
