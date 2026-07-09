"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Link as LinkIcon, Music2, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PromoLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/promo-links").then(r => r.json()),
      fetch("/api/releases").then(r => r.json())
    ]).then(([linksData, releasesData]) => {
      setLinks(linksData.links || []);
      setReleases(releasesData.releases || []);
      setLoading(false);
    });
  }, []);

  const createLink = async (releaseId: number) => {
    setCreating(true);
    try {
      const res = await fetch("/api/promo-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Промо-ссылка создана");
        window.location.href = `/artist/promo-links/${data.link.id}`;
      } else toast.error(data.error);
    } catch(e) { toast.error("Ошибка"); }
    finally { setCreating(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Промо-ссылки</h1>
          <p className="text-muted-foreground mt-1">Умные ссылки для продвижения релизов</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <Card className="border-dashed border-2 hover:bg-white/5 transition-colors cursor-pointer group flex flex-col items-center justify-center p-8 text-center min-h-[200px]" onClick={() => {
            const rel = prompt("Введите ID релиза для создания (для теста). Доступные: " + releases.map(r=>r.id).join(', '));
            if(rel) createLink(parseInt(rel));
          }}>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="font-bold">Создать промо-ссылку</h3>
            <p className="text-sm text-muted-foreground mt-2">Выберите релиз для создания смарт-линка</p>
          </Card>

          {links.map(link => (
            <Card key={link.id} className="hover:border-fuchsia-500/50 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    {link.releaseCover ? <img src={link.releaseCover} className="w-full h-full object-cover" /> : <Music2 className="w-8 h-8 m-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate group-hover:text-fuchsia-400 transition-colors">{link.releaseTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center"><LinkIcon className="w-3 h-3 mr-1"/> /{link.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">{link.viewsCount} просмотров</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/artist/promo-links/${link.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">Настроить</Button>
                  </Link>
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.origin + "/release/" + link.slug); toast.success("Скопировано!"); }}>Копировать</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
