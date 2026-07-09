"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ExternalLink, Plus, Search, Trash2, LinkIcon, Copy } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ManagePromoLink() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [newPlatform, setNewPlatform] = useState("spotify");
  const [newUrl, setNewUrl] = useState("");

  const loadData = () => {
    fetch(`/api/promo-links/${id}`).then(r=>r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [id]);

  const searchUPC = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/promo-links/${id}/search`, { method: "POST" });
      const r = await res.json();
      if(r.success) {
        toast.success(`Найдено площадок: ${r.addedCount}`);
        loadData();
      } else toast.error(r.error);
    } catch(e) {} finally { setSearching(false); }
  };

  const addPlatform = async () => {
    if(!newUrl) return;
    try {
      const res = await fetch(`/api/promo-links/${id}`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ platform: newPlatform, url: newUrl })
      });
      if (res.ok) {
        toast.success("Площадка добавлена");
        setNewUrl("");
        loadData();
      } else toast.error((await res.json()).error);
    } catch(e){}
  };

  if(loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if(!data?.link) return <div>Не найдено</div>;

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/release/${data.link.slug}` : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <Link href="/artist/promo-links">
        <Button variant="ghost" size="sm" className="-ml-4 mb-2"><ArrowLeft className="w-4 h-4 mr-2"/> Назад</Button>
      </Link>

      <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
        <img src={data.link.releaseCover} className="w-32 h-32 rounded-xl object-cover shadow-2xl" />
        <div className="flex-1">
          <h1 className="text-3xl font-black">{data.link.releaseTitle}</h1>
          <p className="text-muted-foreground">{data.link.releaseArtist}</p>
          <div className="flex items-center gap-3 mt-4">
            <div className="bg-black/50 px-4 py-2 rounded-lg text-sm flex items-center border border-white/10">
              <LinkIcon className="w-4 h-4 mr-2 text-fuchsia-400" /> {publicUrl}
            </div>
            <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Скопировано"); }}><Copy className="w-4 h-4" /></Button>
            <Button onClick={() => window.open(publicUrl, '_blank')}><ExternalLink className="w-4 h-4 mr-2" /> Открыть</Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Площадки ({data.platforms.length})</h3>
              <Button variant="secondary" size="sm" onClick={searchUPC} disabled={searching}>
                {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Search className="w-4 h-4 mr-2" />}
                Поиск по UPC
              </Button>
            </div>
            
            <div className="space-y-2">
              {data.platforms.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center font-bold text-[10px] uppercase border border-white/10">{p.platform.slice(0,2)}</div>
                    <span className="font-medium capitalize">{p.platform.replace('_', ' ')}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.open(p.url, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-sm font-medium mb-3">Добавить вручную</p>
              <div className="flex gap-2">
                <select className="bg-white/5 border border-white/10 rounded-xl px-3 text-sm outline-none" value={newPlatform} onChange={e=>setNewPlatform(e.target.value)}>
                  <option value="spotify">Spotify</option>
                  <option value="apple_music">Apple Music</option>
                  <option value="yandex">Yandex</option>
                  <option value="vk">VK</option>
                  <option value="zvuk">Zvuk</option>
                </select>
                <Input placeholder="https://" value={newUrl} onChange={e=>setNewUrl(e.target.value)} className="flex-1" />
                <Button onClick={addPlatform}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Статистика</h3>
            <div className="bg-white/5 rounded-xl p-6 border border-white/5 text-center">
              <div className="text-5xl font-black text-fuchsia-400">{data.link.viewsCount}</div>
              <div className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-bold">Просмотров страницы</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
