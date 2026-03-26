
// ═══════════════════════════════════════════════════════════════════════════
// Header.jsx — Paleta oscura cálida
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState as useStateH, useRef as useRefH, useEffect as useEffectH } from "react";
import { useNavigate as useNavigateH } from "react-router-dom";
import { Bell, Search, Menu, Settings, LogIn, ChevronDown } from "lucide-react";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.jsx";
 
export function Header({ pageTitle, pageSubtitle, onMenuClick, notifications=[], user={name:"Usuario",role:"",avatarUrl:""} }) {
  const [open, setOpen] = useStateH(false);
  const ref = useRefH(null);
  const navigate = useNavigateH();
 
  useEffectH(() => {
    const fn = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if(open) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);
 
  return (
    <header
      className="flex items-center justify-between h-20 px-6 relative z-20 transition-all duration-300"
      style={{ background:'rgba(26,16,8,0.85)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(200,135,78,0.12)' }}
    >
      {/* Logo + título */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="lg:hidden transition"
          style={{ color:'rgba(245,240,232,0.5)' }} onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-wide" style={{ fontFamily:"'Playfair Display',serif", color:'#F5F0E8' }}>
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color:'#C8874E' }}>{pageSubtitle}</p>
          )}
        </div>
      </div>
 
      {/* Acciones */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Buscador desktop */}
        <div className="hidden md:flex relative items-center w-96 h-10 rounded-full transition-all"
          style={{ background:'rgba(245,240,232,0.04)', border:'1px solid rgba(245,240,232,0.08)' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:'rgba(245,240,232,0.25)' }} />
          <Input placeholder="Buscar..." className="flex-1 h-full text-sm bg-transparent border-none pl-9 pr-3 focus:outline-none"
            style={{ color:'rgba(245,240,232,0.7)' }} />
        </div>
 
        {/* Notificaciones */}
        <Button variant="ghost" size="sm" className="relative transition"
          style={{ color:'rgba(245,240,232,0.4)' }}>
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center text-[0.6rem] font-bold rounded-full text-white"
              style={{ background:'#C8874E', boxShadow:'0 0 8px rgba(200,135,78,0.5)' }}>
              {notifications.length}
            </Badge>
          )}
        </Button>
 
        {/* Config */}
        <Button variant="ghost" size="sm" className="hidden sm:flex transition" style={{ color:'rgba(245,240,232,0.4)' }}>
          <Settings className="h-5 w-5" />
        </Button>
 
        {/* Perfil */}
        <div className="relative" ref={ref}>
          <div className="flex items-center gap-3 ml-2 pl-4 cursor-pointer group"
            style={{ borderLeft:'1px solid rgba(245,240,232,0.08)' }}
            onClick={() => setOpen(!open)}>
            <Avatar className="h-9 w-9 transition-all" style={{ border:'2px solid rgba(200,135,78,0.35)' }}>
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} /> :
                <AvatarFallback style={{ background:'rgba(200,135,78,0.2)', color:'#C8874E', fontSize:12, fontWeight:700 }}>
                  {user.name.split(" ").map(n=>n[0]).join("")}
                </AvatarFallback>}
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium" style={{ color:'rgba(245,240,232,0.8)' }}>{user.name}</p>
              {user.role && <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color:'rgba(200,135,78,0.6)' }}>{user.role}</p>}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open?'rotate-180':''}`}
              style={{ color:'rgba(245,240,232,0.3)' }} />
          </div>
 
          {open && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-50"
              style={{ background:'rgba(34,22,8,0.95)', backdropFilter:'blur(12px)',
                border:'1px solid rgba(200,135,78,0.2)', boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
              <div className="p-2">
                <button onClick={() => { setOpen(false); navigate("/login"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all hover:opacity-90"
                  style={{ background:'linear-gradient(135deg,#C8874E,#E9C46A)' }}>
                  <LogIn className="h-4 w-4" /> Iniciar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
 
export default Header;
 