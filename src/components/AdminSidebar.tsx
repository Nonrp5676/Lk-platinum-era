"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, LayoutDashboard, Users, Music2, Newspaper, HelpCircle, Sparkles, UserCog, Ticket, UserPlus, Wallet, TrendingUp, ShieldCheck, BotMessageSquare, ChevronsUpDown, Star } from "lucide-react";
import { User as UserType } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AdminSidebar({ user }: { user: UserType }) {
  const pathname = usePathname();
  const router = useRouter();

  const groups = [
    {
      label: "HOME",
      items: [
        { label: "Дашборд", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Артисты", href: "/admin/artists", icon: Users },
        { label: "Эксклюзив", href: "/admin/exclusive", icon: Star },
        { label: "Верификации", href: "/admin/verifications", icon: ShieldCheck },
      ]
    },
    {
      label: "CONTENT",
      items: [
        { label: "Релизы", href: "/admin/releases", icon: Music2 },
        { label: "Питчинги", href: "/admin/pitchings", icon: TrendingUp },
        { label: "Заявки текстов", href: "/admin/lyrics", icon: Sparkles },
        { label: "Новости", href: "/admin/news", icon: Newspaper },
      ]
    },
    {
      label: "MANAGEMENT",
      items: [
        { label: "Кошельки", href: "/admin/wallets", icon: Wallet },
        { label: "Тикеты", href: "/admin/tickets", icon: Ticket },
        { label: "Заявки", href: "/admin/pending-users", icon: UserPlus },
        { label: "Telegram", href: "/admin/telegram", icon: BotMessageSquare },
        { label: "Администрация", href: "/admin/staff", icon: UserCog },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen bg-[#0E0E0E] border-none text-[#8E8E93] font-sans p-4 shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer text-white" onClick={() => router.push('/')}>
        <img src="/logo.png" className="w-6 h-6 object-contain" alt="Logo" />
        <span className="font-bold text-lg tracking-tight">PLATINUM ERA</span>
      </div>

      <div className="relative mb-8 px-1">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input 
          className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl pl-10 pr-12 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-neutral-600" 
          placeholder="Search..." 
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="bg-white/5 border border-white/10 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded shadow-sm">⌘</span>
          <span className="bg-white/5 border border-white/10 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded shadow-sm">F</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide px-1">
        {groups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.label && <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-3">{group.label}</div>}
            <div className="space-y-1">
              {group.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'text-white bg-white/[0.04]' : 'hover:text-white hover:bg-white/[0.02]'}`}>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-indigo-500/40 blur-[15px] pointer-events-none rounded-r-xl" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="mt-4 p-2 rounded-2xl border border-white/5 bg-[#161616] flex items-center gap-3 cursor-pointer hover:bg-[#1A1A1A] transition-colors">
            <Avatar className="w-10 h-10 border border-white/10 rounded-xl">
              <AvatarImage src={user?.avatarUrl || ''} className="object-cover rounded-xl" />
              <AvatarFallback className="bg-neutral-800 text-neutral-300 text-xs rounded-xl">{(user?.name || 'A').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-semibold truncate flex items-center gap-1">{user?.artistName || user?.name}</p>
              <p className="text-[11px] text-neutral-500 truncate">Admin</p>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-neutral-600 shrink-0 mr-1" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#161616] border-white/10 text-white rounded-xl">
          <DropdownMenuItem onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer rounded-lg">
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
