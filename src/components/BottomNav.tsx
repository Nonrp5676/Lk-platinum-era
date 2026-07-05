"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [myUrl, setMyUrl] = useState("/artist/profile");

  useEffect(() => {
    fetch("/api/social/me").then(r => r.json()).then(d => {
      if (d.username) setMyUrl(`/artist/network/${d.username}`);
    }).catch(() => {});
  }, []);

  const navs = [
    { href: "/artist/feed", icon: Home, label: "Главная" },
    { href: "/artist/network", icon: Users, label: "Артисты" },
    { href: "/artist/notifications", icon: Bell, label: "Уведомления" },
    { href: myUrl, icon: User, label: "Профиль" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t z-[50] flex items-center justify-around h-[70px] pb-safe">
      {navs.map((nav) => {
        // Active logic: if the href is the current pathname exactly, or if we are inside network for Artists (but not inside a specific profile if it's the Artists tab)
        let isActive = false;
        if (nav.label === "Профиль") {
          isActive = pathname === nav.href;
        } else if (nav.label === "Артисты") {
          isActive = pathname === "/artist/network";
        } else {
          isActive = pathname.startsWith(nav.href);
        }
        
        return (
          <Link key={nav.label} href={nav.href} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors", isActive && "text-[#cd792f]")}>
            <nav.icon className={cn("w-6 h-6", isActive && "fill-[#cd792f]/20 text-[#cd792f]")} />
            <span className="text-[10px] font-medium leading-none">{nav.label}</span>
          </Link>
        )
      })}
    </div>
  );
}
