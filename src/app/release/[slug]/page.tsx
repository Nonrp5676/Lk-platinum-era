"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicPromoLink() {
  const pathname = usePathname();
  const slug = pathname.split('/').pop();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/promo-links/public/${slug}`).then(r=>r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [slug]);

  if(loading) return <div className="h-screen w-screen flex items-center justify-center bg-black"><img src="/logo.png" className="w-16 h-16 animate-pulse" /></div>;
  if(!data?.link) return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Релиз не найден</div>;

  const { link, platforms } = data;

  const platformNames: Record<string, string> = {
    spotify: "Spotify",
    apple_music: "Apple Music",
    yandex: "Яндекс Музыка",
    vk: "VK Музыка",
    zvuk: "Звук",
    youtube: "YouTube Music",
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center py-12 px-4 selection:bg-fuchsia-500">
      
      {/* Blurred background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-3xl" />
        <img src={link.releaseCover} className="w-full h-full object-cover scale-110 opacity-40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <img src="/logo.png" className="w-12 h-12 object-contain mb-8 opacity-80" alt="Logo" />

        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 pb-6 flex flex-col items-center text-center">
            <img src={link.releaseCover} className="w-64 h-64 object-cover rounded-2xl shadow-2xl mb-6" />
            <h1 className="text-2xl font-black tracking-tight leading-tight">{link.releaseTitle}</h1>
            <p className="text-white/60 font-medium mt-2">{link.releaseArtist}</p>
          </div>

          <div className="bg-black/40 p-4 space-y-2 border-t border-white/5">
            <p className="text-xs text-center text-white/40 uppercase tracking-widest font-bold mb-4 mt-2">Слушать на площадках</p>
            
            {platforms.map((p: any) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 group">
                <span className="font-bold text-lg">{platformNames[p.platform] || p.platform}</span>
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <Play className="w-4 h-4 ml-1" />
                </div>
              </a>
            ))}

            {platforms.length === 0 && (
              <p className="text-center text-white/50 text-sm py-4">Ссылки скоро появятся</p>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase">Powered by</p>
          <p className="text-white/50 font-bold mt-1">PLATINUM ERA MUSIC</p>
        </div>
      </div>
    </div>
  );
}
