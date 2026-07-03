"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Loader2, ArrowLeft, MoreHorizontal, ShieldAlert, Share2, Grid, Bookmark } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export default function ArtistProfilePage() {
  const pathname = usePathname();
  const username = pathname.split('/').pop();
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link href="/artist/network">
        <Button variant="ghost" size="sm" className="-ml-3 mb-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться к списку
        </Button>
      </Link>

      <Card className="overflow-hidden border-none shadow-sm">
        <div className="h-48 bg-gradient-to-r from-neutral-800 to-neutral-900 w-full relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="sm" className="bg-black/50 text-white hover:bg-black/70 border-none backdrop-blur-md">
              <Share2 className="w-4 h-4 mr-2" /> Поделиться
            </Button>
            <Button variant="secondary" size="icon" className="bg-black/50 text-white hover:bg-black/70 border-none backdrop-blur-md">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16 sm:-mt-20 mb-6 relative z-10">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-lg">
              <AvatarFallback className="text-4xl">A</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Артист {username}</h1>
              <p className="text-muted-foreground font-medium">@{username}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Онлайн</span>
                <span>•</span>
                <span>В PLATINUM ERA MUSIC с 2026 года</span>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8" size="lg">Подписаться</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">О себе</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">Начинающий артист на лейбле. Пишу хип-хоп и поп музыку. Открыт к фитам.</p>
              </div>
              
              <div className="flex gap-6 pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold">124</div>
                  <div className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Подписчика</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Подписок</div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 border-t md:border-t-0 md:border-l md:pl-6 pt-6 md:pt-0">
              <div className="flex items-center gap-6 border-b pb-4 mb-4">
                <button className="text-sm font-semibold text-foreground flex items-center gap-2 border-b-2 border-primary pb-4 -mb-[18px]">
                  <Grid className="w-4 h-4" /> Публикации
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-center text-muted-foreground py-12">Нет публикаций</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
