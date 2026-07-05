"use client";
import React from 'react';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal, Share2, Grid as GridIcon, Heart, MessageSquare, X, CheckCircle2, MapPin, Link as LinkIcon, Flag, Music, Settings, Crown } , BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";


class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="p-12 text-center text-red-500">Render Error: {this.state.error?.message}</div>;
    return this.props.children;
  }
}

export default function ArtistProfilePage() {
  return <ErrorBoundary><ProfileContent /></ErrorBoundary>;
}

function ProfileContent() {
  const pathname = usePathname();
  const router = useRouter();
  const username = pathname.split('/').pop();
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (profile?.customBadge) {
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [profile?.customBadge]);


  const loadData = async () => {
    try {
      const res = await fetch(`/api/social/profile/${username}`);
      const data = await res.json();
      if (data.artist) {
        setProfile(data.artist);
        setPosts(data.posts || []);
      }
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile?.id })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          ...profile,
          isFollowing: data.following,
          followersCount: profile?.followersCount + (data.following ? 1 : -1)
        });
        toast.success(data.following ? "Вы подписались на артиста" : "Вы отписались от артиста");
      }
    } catch(e) {}
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch("/api/social/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, hasLiked: data.liked, likesCount: p.likesCount + (data.liked ? 1 : -1) };
          }
          return p;
        }));
      }
    } catch(e) {}
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Ссылка на профиль скопирована!");
  };

  const handleReport = () => {
    toast.success("Жалоба отправлена на рассмотрение модераторам.");
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><img src="/logo.png" alt="Loading" className="w-16 h-16 animate-pulse object-contain" /></div>;
  if (!profile) return <div className="text-center p-12 text-muted-foreground">Артист не найден</div>;

  return (
    <>
    {/* Page Background */}
    {profile?.isExclusive && profile?.exclusiveColor && (
      <div className={`fixed inset-0 z-[-1] opacity-80 bg-gradient-to-br ${profile.exclusiveColor}`} />
    )}
    <div className="max-w-5xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-500">

      
      {showIntro && profile?.customBadge && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-out fade-out duration-1000 delay-[4000ms] fill-mode-forwards">
          <div className="relative flex items-center justify-center mb-12">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${profile?.exclusiveColor || 'from-amber-400 to-rose-600'} animate-[spin_2s_linear_infinite] blur-[40px] opacity-80 w-64 h-64 -m-20`} />
            <Crown className="w-32 h-32 text-red-500 relative z-10 animate-bounce drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
          </div>
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 animate-pulse uppercase tracking-[0.2em] drop-shadow-2xl text-center">
            {profile.customBadge}
          </h2>
          <p className="text-white/70 mt-6 font-medium text-2xl tracking-widest uppercase text-center">{profile?.artistName || profile?.name}</p>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push("/artist/network")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold text-sm flex items-center gap-1">@{(profile?.username || profile?.uid || "")}{profile?.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyProfileLink}><Share2 className="w-4 h-4 mr-2" /> Поделиться</DropdownMenuItem>
            {!profile?.isMe && <DropdownMenuItem onClick={handleReport} className="text-red-500"><Flag className="w-4 h-4 mr-2" /> Пожаловаться</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden md:flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/artist/network")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад к списку
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-2xl">
        {/* Cover Image / Gradient */}
        
        <div className="h-48 md:h-64 bg-gradient-to-br w-full relative group overflow-hidden from-neutral-800 to-neutral-900">
          {profile?.coverUrl && <img src={profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-90" />}

          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          <div className="hidden md:flex absolute top-4 right-4 gap-2">
            <Button variant="secondary" size="sm" onClick={copyProfileLink} className="bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-md">
              <Share2 className="w-4 h-4 mr-2" /> Поделиться
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-md">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!profile?.isMe && <DropdownMenuItem onClick={handleReport} className="text-red-500"><Flag className="w-4 h-4 mr-2" /> Пожаловаться</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-20 md:-mt-24 mb-8 relative z-10">
            {/* Avatar */}
            <div className="relative">
              
            {profile?.isExclusive && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 animate-[spin_3s_linear_infinite] -m-1" />
            )}
            <Avatar className="w-36 h-36 md:w-44 md:h-44 border-[6px] border-background shadow-2xl bg-muted relative z-10">
                <AvatarImage src={profile?.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="text-5xl font-light">{(profile?.artistName || profile?.name || "A")?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-background rounded-full shadow-sm" title="В сети"></div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
              
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-2">{profile?.artistName || profile?.name}{profile?.isVerified && <BadgeCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-500 fill-blue-500/10 shrink-0" />}</h1>
                {profile?.customBadge && (
                  <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Crown className="w-3.5 h-3.5" /> {profile.customBadge}
                  </div>
                )}
                
              </div>

              <p className="text-muted-foreground font-medium text-lg md:text-xl">@{(profile?.username || profile?.uid || '')}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4 text-[#cd792f]" /> СНГ</div>
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full"><Music className="w-4 h-4 text-[#cd792f]" /> PLATINUM ERA MUSIC</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
              {profile?.isMe ? (
                <Link href="/artist/profile" className="w-full md:w-auto">
                  <Button className="w-full md:w-auto px-8 shadow-md" size="lg" variant="default">
                    <Settings className="w-4 h-4 mr-2"/> Настройки профиля
                  </Button>
                </Link>
              ) : (
                <Button 
                  className={cn("w-full md:w-auto px-10 shadow-md transition-all", profile?.isFollowing ? "bg-muted text-foreground hover:bg-muted/80" : "bg-[#cd792f] hover:bg-[#b8661f] text-white")} 
                  size="lg" 
                  onClick={handleFollow} 
                >
                  {profile?.isFollowing ? "Отписаться" : "Подписаться"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Bio & Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-muted/30 p-5 rounded-2xl border border-muted/50">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="w-1 h-5 bg-[#cd792f] rounded-full"></span> Об артисте</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {profile?.bio || "Этот артист предпочитает говорить через свою музыку. Описание пока не добавлено."}
                </p>
                {profile?.isMe && !profile?.bio && (
                  <Link href="/artist/profile"><Button variant="link" className="px-0 mt-2 text-[#cd792f]">Добавить описание</Button></Link>
                )}
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-muted/30 p-4 rounded-2xl border border-muted/50 text-center">
                  <div className="text-3xl font-black text-foreground">{profile?.followersCount || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Подписчиков</div>
                </div>
                <div className="flex-1 bg-muted/30 p-4 rounded-2xl border border-muted/50 text-center">
                  <div className="text-3xl font-black text-foreground">{profile?.followingCount || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Подписок</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Posts & Music */}
            <div className="lg:col-span-8">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-6">
                  <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#cd792f] rounded-none px-2 py-3 text-base">
                    <GridIcon className="w-4 h-4 mr-2" /> Публикации
                  </TabsTrigger>
                  <TabsTrigger value="music" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#cd792f] rounded-none px-2 py-3 text-base">
                    <Music className="w-4 h-4 mr-2" /> Релизы
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts" className="pt-6 outline-none">
                  {posts.length > 0 ? (
                    <div className="space-y-6">
                      {posts.map((post) => (
                        <Card key={post.id} className="border border-muted/60 shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow">
                          <CardContent className="p-0">
                            {/* Post Header */}
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border">
                                  <AvatarImage src={profile?.avatarUrl || ''} />
                                  <AvatarFallback>{(profile?.artistName || "A")?.charAt(0) || "A"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold text-sm leading-none flex items-center gap-1">{profile?.artistName || profile?.name}{profile?.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</h4>
                                  <span className="text-xs text-muted-foreground mt-1 block">
                                    {post?.createdAt ? String(post.createdAt).split("T")[0] : ""}
                                  </span>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreHorizontal className="w-5 h-5" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(window.location.origin + "/artist/network/" + (profile?.username || profile?.uid || '')); toast.success("Ссылка скопирована!"); }}>
                                    <LinkIcon className="w-4 h-4 mr-2" /> Копировать ссылку
                                  </DropdownMenuItem>
                                  {!profile?.isMe && <DropdownMenuItem onClick={handleReport} className="text-red-500"><Flag className="w-4 h-4 mr-2" /> Пожаловаться</DropdownMenuItem>}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {/* Post Content */}
                            {post.content && (
                              <div className="px-5 pb-4 text-[15px] whitespace-pre-wrap text-foreground/90">
                                {post.content}
                              </div>
                            )}
                            
                            {/* Post Image */}
                            {post.imageUrl && (
                              <div className="w-full max-h-[600px] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center cursor-pointer border-y border-muted/30" onClick={() => setViewerImage(post.imageUrl)}>
                                <img src={post.imageUrl} className="w-full max-h-[600px] object-cover" alt="Post" loading="lazy" />
                              </div>
                            )}
                            
                            {/* Post Actions */}
                            <div className="p-3 px-4 flex items-center justify-between bg-muted/10">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className={cn("rounded-full px-4 font-medium transition-colors", post.hasLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10')} onClick={() => handleLike(post.id)}>
                                  <Heart className={cn("w-5 h-5 mr-2", post.hasLiked && "fill-current")} /> 
                                  {post.likesCount || 0}
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground font-medium hover:bg-blue-500/10 hover:text-blue-500" onClick={() => toast.info("Комментарии будут доступны в следующем обновлении!")}>
                                  <MessageSquare className="w-5 h-5 mr-2" /> 0
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground font-medium hover:bg-green-500/10 hover:text-green-500" onClick={() => { navigator.clipboard.writeText(window.location.origin + "/artist/network/" + (profile?.username || profile?.uid || '')); toast.success("Ссылка скопирована!"); }}>
                                  <Share2 className="w-5 h-5" />
                                </Button>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{post.viewsCount} просмотров</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-muted">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <GridIcon className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-bold">Нет публикаций</h3>
                      <p className="text-muted-foreground mt-2 max-w-sm">Артист пока не сделал ни одной записи. Следите за обновлениями!</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="music" className="pt-6 outline-none">
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-muted">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Music className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold">Дискография скрыта</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">Отображение релизов на странице профиля появится в ближайшее время.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Viewer */}
      {viewerImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md" onClick={() => setViewerImage(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <img src={viewerImage} className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-sm" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
    </>
  );
}
