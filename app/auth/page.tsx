"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
        setMessage({ text: "ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบกล่องจดหมาย", ok: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset`,
        });
        if (error) throw error;
        setMessage({ text: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", ok: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setMessage({ text: msg, ok: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setMessage({ text: error.message, ok: false }); setLoading(false); }
  }

  return (
    <main className="premium-shell auth-page">
      <div className="grain" />
      <div className="auth-card">
        <div className="auth-header">
          <a href="/" className="brand-lockup" style={{ textDecoration: "none", justifyContent: "center" }}>
            <span className="brand-sigil">✦</span>
            <span>
              <strong>ASTRA GARDEN</strong>
              <small>Astrology translated into gentle guidance</small>
            </span>
          </a>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>เข้าสู่ระบบ</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>สมัครสมาชิก</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label className="lux-field">
              <span>ชื่อที่แสดง</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อของคุณ" required />
            </label>
          )}
          <label className="lux-field">
            <span>อีเมล</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </label>
          {mode !== "forgot" && (
            <label className="lux-field">
              <span>รหัสผ่าน</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </label>
          )}

          {message && (
            <div className={`auth-message ${message.ok ? "ok" : "err"}`}>{message.text}</div>
          )}

          <button type="submit" className="luxury-button auth-submit" disabled={loading}>
            {loading ? "กำลังดำเนินการ…" : mode === "login" ? "เข้าสู่ระบบ" : mode === "signup" ? "สมัครสมาชิก" : "ส่งลิงก์รีเซ็ต"}
          </button>

          {mode === "login" && (
            <button type="button" className="auth-link" onClick={() => setMode("forgot")}>
              ลืมรหัสผ่าน?
            </button>
          )}
        </form>

        <div className="auth-divider"><span>หรือ</span></div>

        <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    </main>
  );
}
