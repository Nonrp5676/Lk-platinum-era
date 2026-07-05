"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Loader2, Star, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ExclusiveArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingIds, setSavingIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/artists")
      .then(res => res.json())
      .then(data => {
        setArtists(data.artists || []);
        setLoading(false);
      });
  }, []);

  const handleSave = async (artistId: number) => {
    setSavingIds(prev => ({ ...prev, [artistId]: true }));
    const artist = artists.find(a => a.id === artistId);
    
    try {
      const res = await fetch(`/api/admin/artists/${artistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isExclusive: !!artist.isExclusive,
          exclusiveColor: artist.exclusiveColor || "from-[#cd792f] via-purple-900 to-black",
          customBadge: artist.customBadge || ""
        })
      });
      if (res.ok) {
        toast.success(`Настройки эксклюзива сохранены`);
      } else {
        toast.error("Ошибка сохранения");
      }
    } catch(e) {
      toast.error("Сетевая ошибка");
    } finally {
      setSavingIds(prev => ({ ...prev, [artistId]: false }));
    }
  };

  const updateArtist = (id: number, key: string, value: any) => {
    setArtists(prev => prev.map(a => a.id === id ? { ...a, [key]: value } : a));
  };

  const filteredArtists = artists.filter(a => 
    (a.name?.toLowerCase().includes(search.toLowerCase()) || 
     a.artistName?.toLowerCase().includes(search.toLowerCase()) || 
     a.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500/20" /> 
            Эксклюзивные артисты
          </h1>
          <p className="text-muted-foreground mt-1">Управление анимированными профилями и кастомными цветами</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск артиста..."
            className="pl-9 bg-white dark:bg-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Артист</TableHead>
                <TableHead>Статус эксклюзива</TableHead>
                <TableHead>Цвет (Tailwind)</TableHead>
                <TableHead>Бейдж (Корона)</TableHead>
                <TableHead>Предпросмотр</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-32">
                    Ничего не найдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredArtists.map((artist) => (
                  <TableRow key={artist.id} className={artist.isExclusive ? "bg-amber-500/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border relative">
                          {artist.isExclusive && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 animate-[spin_3s_linear_infinite] -m-0.5" />
                          )}
                          <AvatarImage src={artist.avatarUrl} className="relative z-10" />
                          <AvatarFallback className="relative z-10">{(artist.artistName || artist.name || "A").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{artist.artistName || artist.name}</p>
                          <p className="text-xs text-muted-foreground">{artist.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={!!artist.isExclusive} 
                          onCheckedChange={(val) => updateArtist(artist.id, "isExclusive", val)} 
                        />
                        <span className="text-sm font-medium">{artist.isExclusive ? "Включен" : "Выключен"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={artist.exclusiveColor || ""} 
                        onChange={(e) => updateArtist(artist.id, "exclusiveColor", e.target.value)}
                        placeholder="from-amber-400 via-orange-500 to-rose-600"
                        className="max-w-[200px]"
                        disabled={!artist.isExclusive}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={artist.customBadge || ""} 
                        onChange={(e) => updateArtist(artist.id, "customBadge", e.target.value)}
                        placeholder="ADMIN"
                        className="max-w-[120px]"
                        disabled={!artist.isExclusive}
                      />
                    </TableCell>
                    <TableCell>
                      <div className={`h-8 w-24 rounded-md border shadow-inner bg-gradient-to-br ${artist.isExclusive ? (artist.exclusiveColor || "from-[#cd792f] via-purple-900 to-black") : "bg-muted"}`}></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleSave(artist.id)} disabled={savingIds[artist.id]}>
                        {savingIds[artist.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                        {savingIds[artist.id] ? "" : "Сохранить"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
