"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Loader2 } , BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NetworkPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social/users")
      .then(res => res.json())
      .then(data => {
        setArtists(data.artists || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Артисты</h1>
          <p className="text-muted-foreground mt-1">Сеть артистов PLATINUM ERA MUSIC</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск артистов..." className="pl-9 h-10" />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><img src="/logo.png" alt="Loading" className="w-12 h-12 animate-pulse object-contain" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist) => (
            <Link key={artist.id} href={`/artist/network/${artist.username || artist.uid}`}>
              <Card className="hover:border-[#cd792f]/50 transition-colors cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border bg-muted">
                      {artist.avatarUrl ? <AvatarImage src={artist.avatarUrl} /> : <AvatarFallback><Users className="w-6 h-6 text-muted-foreground" /></AvatarFallback>}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-[#cd792f] transition-colors line-clamp-1 flex items-center gap-1">{artist.artistName || artist.name}{artist.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</h3>
                      <p className="text-sm text-muted-foreground">@{artist.username || artist.uid}</p>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{artist.bio || "Нет информации"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {artists.length === 0 && <p className="text-muted-foreground p-4">Артисты не найдены.</p>}
        </div>
      )}
    </div>
  );
}
