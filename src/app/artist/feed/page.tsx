"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Video, MoreHorizontal, MessageSquare, Share2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Лента</h1>
      </div>

      {/* Stories Banner */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors relative">
            <Camera className="w-6 h-6 text-muted-foreground" />
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-background">+</div>
          </div>
          <span className="text-xs font-medium">Ваша история</span>
        </div>
        
        {/* Placeholder Stories */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarFallback>A{i}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center">Артист {i}</span>
          </div>
        ))}
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea 
                className="w-full bg-transparent resize-none outline-none placeholder:text-muted-foreground min-h-[60px]" 
                placeholder="Что нового в вашем творчестве?"
              />
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                    <ImageIcon className="w-4 h-4 mr-2" /> Фото
                  </Button>
                </div>
                <Button size="sm" className="h-8">Опубликовать</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {[1, 2].map((post) => (
          <Card key={post}>
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>A{post}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm leading-none">Артист {post}</h4>
                    <span className="text-xs text-muted-foreground">2 часа назад</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button>
              </div>
              
              <div className="px-4 pb-3 text-sm">
                Привет всем! Скоро выходит мой новый трек на PLATINUM ERA MUSIC. Ждете? 🎵🔥
              </div>
              
              <div className="w-full aspect-video bg-muted flex items-center justify-center border-y">
                <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
              </div>
              
              <div className="p-2 px-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:text-red-500">
                    <Heart className="w-4 h-4 mr-2" /> 24
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground">
                    <MessageSquare className="w-4 h-4 mr-2" /> 5
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground">
                    <Share2 className="w-4 h-4 mr-2" /> Поделиться
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">142 просмотра</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
