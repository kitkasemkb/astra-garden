"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function UserMenu() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }

  if (!user) {
    return (
      <a href="/auth" className="user-login-btn">
        เข้าสู่ระบบ
      </a>
    );
  }

  const initial = (user.user_metadata?.display_name || user.email || "?")[0].toUpperCase();

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="user-avatar-btn" onClick={() => setOpen(!open)} title={user.email}>
        {user.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="" className="user-avatar-img" />
          : <span>{initial}</span>
        }
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <strong>{user.user_metadata?.display_name || "สมาชิก"}</strong>
            <small>{user.email}</small>
          </div>
          <a href="/history" className="user-dropdown-item" onClick={() => setOpen(false)}>
            📖 ประวัติการดูดวง
          </a>
          <a href="/horoscope" className="user-dropdown-item" onClick={() => setOpen(false)}>
            ⭐ Daily Briefing
          </a>
          <a href="/synastry" className="user-dropdown-item" onClick={() => setOpen(false)}>
            💞 เปรียบดวงคู่
          </a>
          <button className="user-dropdown-item signout" onClick={signOut}>
            🚪 ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
