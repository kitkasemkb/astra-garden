"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import { getZodiacSign } from "@/lib/zodiac";
import type { Lang } from "@/lib/i18n";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS    = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS_BE = Array.from({ length: 90 }, (_, i) => 2568 - i);
const YEARS_CE = Array.from({ length: 90 }, (_, i) => 2025 - i);
const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PROVINCES = [
  { name:"กรุงเทพมหานคร", lat:13.7563, lon:100.5018 },
  { name:"กระบี่",         lat:8.0863,  lon:98.9063  },
  { name:"กาญจนบุรี",      lat:14.0228, lon:99.5328  },
  { name:"กาฬสินธุ์",      lat:16.4322, lon:103.5066 },
  { name:"กำแพงเพชร",      lat:16.4828, lon:99.5227  },
  { name:"ขอนแก่น",        lat:16.4419, lon:102.835  },
  { name:"จันทบุรี",       lat:12.6113, lon:102.1038 },
  { name:"ฉะเชิงเทรา",     lat:13.6904, lon:101.0779 },
  { name:"ชลบุรี",         lat:13.3611, lon:100.9847 },
  { name:"ชัยนาท",         lat:15.1852, lon:100.1251 },
  { name:"ชัยภูมิ",        lat:15.8068, lon:102.0315 },
  { name:"ชุมพร",          lat:10.493,  lon:99.18    },
  { name:"เชียงราย",       lat:19.9105, lon:99.8406  },
  { name:"เชียงใหม่",      lat:18.7883, lon:98.9853  },
  { name:"ตรัง",           lat:7.5594,  lon:99.6114  },
  { name:"ตราด",           lat:12.2428, lon:102.5175 },
  { name:"ตาก",            lat:16.8838, lon:99.1258  },
  { name:"นครนายก",        lat:14.2069, lon:101.2131 },
  { name:"นครปฐม",         lat:13.8199, lon:100.0622 },
  { name:"นครพนม",         lat:17.392,  lon:104.7696 },
  { name:"นครราชสีมา",     lat:14.9799, lon:102.0977 },
  { name:"นครศรีธรรมราช",  lat:8.4304,  lon:99.9631  },
  { name:"นครสวรรค์",      lat:15.7047, lon:100.1372 },
  { name:"นนทบุรี",        lat:13.8621, lon:100.5144 },
  { name:"นราธิวาส",       lat:6.4255,  lon:101.8253 },
  { name:"น่าน",           lat:18.7756, lon:100.773  },
  { name:"บึงกาฬ",         lat:18.3609, lon:103.6466 },
  { name:"บุรีรัมย์",      lat:14.993,  lon:103.1029 },
  { name:"ปทุมธานี",       lat:14.0208, lon:100.525  },
  { name:"ประจวบคีรีขันธ์", lat:11.8124, lon:99.7973  },
  { name:"ปราจีนบุรี",     lat:14.05,   lon:101.372  },
  { name:"ปัตตานี",        lat:6.8695,  lon:101.2505 },
  { name:"พระนครศรีอยุธยา", lat:14.3532, lon:100.5689 },
  { name:"พะเยา",          lat:19.1665, lon:99.9019  },
  { name:"พังงา",          lat:8.4501,  lon:98.5255  },
  { name:"พัทลุง",         lat:7.6167,  lon:100.074  },
  { name:"พิจิตร",         lat:16.4418, lon:100.3488 },
  { name:"พิษณุโลก",       lat:16.8211, lon:100.2659 },
  { name:"เพชรบุรี",       lat:13.1112, lon:99.939   },
  { name:"เพชรบูรณ์",      lat:16.419,  lon:101.1606 },
  { name:"แพร่",           lat:18.1446, lon:100.1403 },
  { name:"ภูเก็ต",         lat:7.8804,  lon:98.3923  },
  { name:"มหาสารคาม",      lat:16.1848, lon:103.3007 },
  { name:"มุกดาหาร",       lat:16.5422, lon:104.7209 },
  { name:"แม่ฮ่องสอน",     lat:19.301,  lon:97.9654  },
  { name:"ยโสธร",          lat:15.7926, lon:104.1453 },
  { name:"ยะลา",           lat:6.5411,  lon:101.2804 },
  { name:"ร้อยเอ็ด",       lat:16.0538, lon:103.652  },
  { name:"ระนอง",          lat:9.9529,  lon:98.6085  },
  { name:"ระยอง",          lat:12.6814, lon:101.2816 },
  { name:"ราชบุรี",        lat:13.5283, lon:99.8134  },
  { name:"ลพบุรี",         lat:14.7995, lon:100.6534 },
  { name:"ลำปาง",          lat:18.2888, lon:99.4909  },
  { name:"ลำพูน",          lat:18.5745, lon:99.0087  },
  { name:"เลย",            lat:17.486,  lon:101.7223 },
  { name:"ศรีสะเกษ",       lat:15.1186, lon:104.322  },
  { name:"สกลนคร",         lat:17.1546, lon:104.1348 },
  { name:"สงขลา",          lat:7.1898,  lon:100.5951 },
  { name:"สตูล",           lat:6.6238,  lon:100.0674 },
  { name:"สมุทรปราการ",    lat:13.5991, lon:100.5998 },
  { name:"สมุทรสงคราม",    lat:13.4098, lon:100.0023 },
  { name:"สมุทรสาคร",      lat:13.5475, lon:100.2744 },
  { name:"สระแก้ว",        lat:13.824,  lon:102.0646 },
  { name:"สระบุรี",        lat:14.5289, lon:100.9101 },
  { name:"สิงห์บุรี",      lat:14.8936, lon:100.3967 },
  { name:"สุโขทัย",        lat:17.0056, lon:99.8264  },
  { name:"สุพรรณบุรี",     lat:14.4745, lon:100.1177 },
  { name:"สุราษฎร์ธานี",   lat:9.1382,  lon:99.3215  },
  { name:"สุรินทร์",       lat:14.8829, lon:103.4937 },
  { name:"หนองคาย",        lat:17.8783, lon:102.7413 },
  { name:"หนองบัวลำภู",    lat:17.2218, lon:102.426  },
  { name:"อ่างทอง",        lat:14.5896, lon:100.4551 },
  { name:"อำนาจเจริญ",     lat:15.8585, lon:104.6288 },
  { name:"อุดรธานี",       lat:17.4138, lon:102.7872 },
  { name:"อุตรดิตถ์",      lat:17.6201, lon:100.0993 },
  { name:"อุทัยธานี",      lat:15.3835, lon:100.0246 },
  { name:"อุบลราชธานี",    lat:15.2287, lon:104.8564 },
];

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const supabase = createClient();

  const [step, setStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedLang, setSelectedLang] = useState<Lang>(lang);
  // birth
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [yearInput, setYearInput] = useState(""); // BE or CE depending on lang
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [province, setProvince] = useState("กรุงเทพมหานคร");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      const meta = data.session.user.user_metadata;
      // already onboarded
      if (meta?.onboarding_done) { router.push("/"); return; }
      const name = meta?.full_name || meta?.display_name || data.session.user.email?.split("@")[0] || "";
      setDisplayName(name);
    });
  }, []);

  function nextStep() { setStep(s => Math.min(s + 1, 3) as Step); }
  function prevStep() { setStep(s => Math.max(s - 1, 1) as Step); }

  async function saveBirth() {
    if (!day || !month || !yearInput || hour === "") return;
    setSaving(true); setError("");
    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session;
      }
      if (!session) throw new Error("Session expired");

      const yearNum = Number(yearInput);
      const yearBE = lang === "th" ? yearNum : yearNum + 543;
      const yearCE = lang === "th" ? yearNum - 543 : yearNum;
      const birthDate = `${yearCE}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const birthTime = `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
      const prov = PROVINCES.find(p => p.name === province) || PROVINCES[0];
      const zodiac = getZodiacSign(Number(month), Number(day));

      const { error: err } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          birth_date: birthDate, birth_time: birthTime,
          birth_year_be: yearBE, birth_month: Number(month),
          birth_day: Number(day), birth_hour: Number(hour),
          birth_minute: Number(minute), province,
          latitude: prov.lat, longitude: prov.lon,
          zodiac_sign: zodiac,
          preferred_lang: selectedLang,
        },
      });
      if (err) throw err;
      nextStep();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function finishOnboarding() {
    await supabase.auth.updateUser({ data: { onboarding_done: true, preferred_lang: selectedLang } });
    setLang(selectedLang);
    router.push("/");
  }

  const months = lang === "en" ? MONTHS_EN : MONTHS_TH;
  const yearLabel = lang === "en" ? "Year (CE)" : "ปี พ.ศ.";
  const years = lang === "en" ? YEARS_CE : YEARS_BE;

  return (
    <main className="premium-shell auth-page">
      <div className="grain" />
      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Logo */}
        <div className="auth-header">
          <a href="/" className="brand-lockup" style={{ textDecoration: "none", justifyContent: "center" }}>
            <span className="brand-sigil">✦</span>
            <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
          </a>
        </div>

        {/* Progress */}
        <div className="onboarding-progress">
          {[1, 2, 3].map(n => (
            <div key={n} className={`onboarding-dot ${step >= n ? "active" : ""} ${step > n ? "done" : ""}`} />
          ))}
          <span className="onboarding-progress-label">
            {t("onboarding.progress")} {step} {t("onboarding.of")} 3
          </span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="onboarding-step">
            <div className="auth-birth-header">
              <span style={{ fontSize: 40 }}>✦</span>
              <h3>{t("onboarding.step1Title")}</h3>
              <p>{t("onboarding.step1Desc")}</p>
            </div>
            <label className="lux-field" style={{ marginBottom: 16 }}>
              <span>{t("onboarding.nameLabel")}</span>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={t("onboarding.namePlaceholder")}
              />
            </label>
            <label className="lux-field" style={{ marginBottom: 24 }}>
              <span>{t("onboarding.langLabel")}</span>
              <select value={selectedLang} onChange={e => { const l = e.target.value as Lang; setSelectedLang(l); setLang(l); }}>
                <option value="th">ภาษาไทย</option>
                <option value="en">English</option>
              </select>
            </label>
            <button className="luxury-button auth-submit" onClick={nextStep}>
              {t("btn.next")} →
            </button>
          </div>
        )}

        {/* Step 2: Birth Data */}
        {step === 2 && (
          <div className="onboarding-step">
            <div className="auth-birth-header">
              <h3>{t("onboarding.step2Title")}</h3>
              <p>{t("onboarding.step2Desc")}</p>
            </div>
            <div className="auth-birth-form">
              <div className="auth-birth-row">
                <label className="lux-field">
                  <span>{t("birth.day")}</span>
                  <select value={day} onChange={e => setDay(e.target.value)}>
                    <option value="">{t("birth.day")}</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="lux-field">
                  <span>{t("birth.month")}</span>
                  <select value={month} onChange={e => setMonth(e.target.value)}>
                    <option value="">{t("birth.month")}</option>
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </label>
                <label className="lux-field">
                  <span>{yearLabel}</span>
                  <select value={yearInput} onChange={e => setYearInput(e.target.value)}>
                    <option value="">{yearLabel}</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
              </div>
              <div className="auth-birth-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label className="lux-field">
                  <span>{t("birth.hour")}</span>
                  <select value={hour} onChange={e => setHour(e.target.value)}>
                    <option value="">{t("birth.hour")}</option>
                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                  </select>
                </label>
                <label className="lux-field">
                  <span>{t("birth.minute")}</span>
                  <select value={minute} onChange={e => setMinute(e.target.value)}>
                    {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                  </select>
                </label>
              </div>
              <label className="lux-field">
                <span>{t("birth.province")}</span>
                <select value={province} onChange={e => setProvince(e.target.value)}>
                  {PROVINCES.map(p => <option key={p.name}>{p.name}</option>)}
                </select>
              </label>
            </div>
            {error && <div className="auth-message err">{error}</div>}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="ghost-button" onClick={prevStep}>{t("btn.back")}</button>
              <button
                className="luxury-button auth-submit"
                onClick={saveBirth}
                disabled={!day || !month || !yearInput || hour === "" || saving}
                style={{ flex: 1 }}
              >
                {saving ? t("onboarding.saving") : t("onboarding.saveBirth")}
              </button>
            </div>
            <button className="auth-link" style={{ marginTop: 10, display: "block", textAlign: "center" }} onClick={nextStep}>
              {t("onboarding.skip")}
            </button>
          </div>
        )}

        {/* Step 3: Choose Plan */}
        {step === 3 && (
          <div className="onboarding-step">
            <div className="auth-birth-header">
              <span style={{ fontSize: 40 }}>✦</span>
              <h3>{t("onboarding.step3Title")}</h3>
              <p>{t("onboarding.step3Desc")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0" }}>
              <div className="pricing-card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Free</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 12 }}>
                  {lang === "th" ? "฿0" : "$0"}
                </div>
                <ul className="pricing-features" style={{ fontSize: 13 }}>
                  <li><span className="pricing-check">✦</span>{t("pricing.feature.readings3")}</li>
                  <li><span className="pricing-check">✦</span>{t("pricing.feature.birthChart")}</li>
                  <li><span className="pricing-check">✦</span>{t("pricing.feature.tarot")}</li>
                </ul>
              </div>
              <div className="pricing-card pricing-card-pro" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Pro</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 12 }}>
                  {lang === "th" ? "฿149/เดือน" : "$9/mo"}
                </div>
                <ul className="pricing-features" style={{ fontSize: 13 }}>
                  <li><span className="pricing-check">✦</span>{t("pricing.feature.readingsUnlimited")}</li>
                  <li><span className="pricing-check">✦</span>{t("pricing.feature.synastry")}</li>
                  <li><span className="pricing-check">✦</span>{t("pricing.feature.priority")}</li>
                </ul>
              </div>
            </div>
            <a href="/pricing" className="luxury-button auth-submit" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 10 }}>
              {t("pricing.proCta")}
            </a>
            <button className="ghost-button" style={{ width: "100%" }} onClick={finishOnboarding}>
              {t("onboarding.startFree")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
