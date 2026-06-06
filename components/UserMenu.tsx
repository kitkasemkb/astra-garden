"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { IconHistory, IconStar, IconHearts, IconLogout, IconWork, IconGalaxy, IconCrystalBall } from "@/components/AstraIcons";
import LangToggle from "@/components/LangToggle";

export default function UserMenu() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const dropEl = document.getElementById("user-dropdown-portal");
      if (
        ref.current && !ref.current.contains(target) &&
        dropEl && !dropEl.contains(target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }

  if (!user) {
    return (
      <>
        <LangToggle />
        <a href="/auth" className="user-login-btn">เข้าสู่ระบบ</a>
      </>
    );
  }

  const initial = (user.user_metadata?.display_name || user.email || "?")[0].toUpperCase();
  const isPro = user.user_metadata?.subscription_tier === "pro";

  const dropdown = open && mounted ? createPortal(
    <div
      id="user-dropdown-portal"
      className="user-dropdown"
      style={{ position:"fixed", top: dropPos.top, right: dropPos.right, zIndex: 99999 }}
    >
      <div className="user-dropdown-info">
        <strong>{user.user_metadata?.display_name || "สมาชิก"}</strong>
        <small>{user.email}</small>
        {isPro && <span className="user-pro-badge">PRO</span>}
      </div>
      <a href="/pricing" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconStar size={16} /> {isPro ? "จัดการแผน" : "อัปเกรด Pro"}
      </a>
      <a href="/tarot-voice" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconCrystalBall size={16} /> Voice Tarot · คุยกับ Astra
      </a>
      <a href="/history" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconHistory size={16} /> ประวัติรายงาน
      </a>
      <a href="/horoscope" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconStar size={16} /> Daily Briefing
      </a>
      <a href="/decision" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconGalaxy size={16} /> Astro Decision Engine
      </a>
      <a href="/synastry" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconHearts size={16} /> เปรียบดวงคู่
      </a>
      <a href="/ikigai" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconStar size={16} /> Ikigai จากดวงชะตา
      </a>
      <a href="/career" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconWork size={16} /> Career Path Advisor
      </a>
      <a href="/shadow" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconStar size={16} /> Shadow Side
      </a>
      <a href="/timeline" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconStar size={16} /> Ikigai Timeline
      </a>
      <a href="/relationship-ikigai" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconHearts size={16} /> Relationship Ikigai
      </a>
      <a href="/purpose-letter" className="user-dropdown-item" onClick={() => setOpen(false)}>
        <IconGalaxy size={16} /> Life Purpose Letter
      </a>
      <button className="user-dropdown-item signout" onClick={signOut}>
        <IconLogout size={16} /> ออกจากระบบ
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <div className="user-menu-wrap" ref={ref} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <LangToggle />
      {isPro && <span className="user-pro-badge-inline">PRO</span>}
      <button className="user-avatar-btn" ref={btnRef} onClick={toggleOpen} title={user.email}>
        {user.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="" className="user-avatar-img" />
          : <span>{initial}</span>
        }
      </button>
      {dropdown}
    </div>
  );
}
