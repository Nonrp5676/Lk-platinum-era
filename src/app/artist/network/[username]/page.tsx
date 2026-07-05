"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal, Share2, Grid as GridIcon, Heart, MessageSquare, X, MapPin, Flag, Music, Settings, Crown, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
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
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
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
          followersCount: (profile?.followersCount || 0) + (data.following ? 1 : -1)
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
    navigator.clipboard.writeText(window.location.origin + "/artist/network/" + (profile?.username || profile?.uid || ''));
    toast.success("Ссылка на профиль скопирована!");
  };

  const handleReport = () => {
    toast.success("Жалоба отправлена на рассмотрение модераторам.");
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><img src="/logo.png" alt="Loading" className="w-16 h-16 animate-pulse object-contain" /></div>;
  if (!profile) return <div className="text-center p-12 text-muted-foreground">Артист не найден</div>;

  return (
    <>
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

      {/* Full Page Background Wrapper */}
      <div className="min-h-screen bg-background relative animate-in fade-in duration-500 pb-24 md:pb-12">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 sticky top-0 bg-background/60 backdrop-blur-xl z-40 border-b border-border/30">
          <Button variant="ghost" size="icon" onClick={() => router.push("/artist/network")} className="hover:bg-transparent">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-sm flex items-center gap-1">@{(profile?.username || profile?.uid || "")}{profile?.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-transparent"><MoreHorizontal className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={copyProfileLink} className="rounded-xl"><Share2 className="w-4 h-4 mr-2" /> Поделиться</DropdownMenuItem>
              {!profile?.isMe && <DropdownMenuItem onClick={handleReport} className="text-red-500 rounded-xl"><Flag className="w-4 h-4 mr-2" /> Пожаловаться</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center p-6 absolute top-0 left-0 z-40 w-full justify-between">
          <Button variant="secondary" className="rounded-full bg-background/50 backdrop-blur-md border-none shadow-sm hover:bg-background/80" onClick={() => router.push("/artist/network")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Назад
          </Button>
        </div>

        {/* Modern Header Section */}
        <div className="relative pt-16 md:pt-24 pb-12 px-6 flex flex-col items-center justify-center border-b border-border/10">
          
          {/* Extremely Large Avatar */}
          <div className="relative z-30 shrink-0 mb-6">
            {profile?.isExclusive && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 animate-[spin_3s_linear_infinite] -m-2" />
            )}
            <Avatar className="w-48 h-48 md:w-80 md:h-80 border-[8px] border-background relative z-10 bg-muted drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]">
              <AvatarImage src={profile?.avatarUrl || ''} className="object-cover" />
              <AvatarFallback className="text-6xl md:text-9xl font-light">{(profile?.artistName || profile?.name || "A")?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-green-500 border-4 border-background rounded-full shadow-lg z-20" title="В сети"></div>
          </div>

          {/* Profile Info Centered */}
          <div className="relative z-30 w-full max-w-2xl text-center flex flex-col items-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{profile?.artistName || profile?.name}</h1>
              <div className="flex items-center gap-2">
                {profile?.customBadge && (
                  <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Crown className="w-3.5 h-3.5" /> {profile.customBadge}
                  </div>
                )}
                {profile?.isVerified && <BadgeCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-500 fill-blue-500/10 shrink-0" />}
              </div>
            </div>
            
            <p className="text-muted-foreground font-semibold text-lg md:text-xl mb-6">@{profile?.username || profile?.uid || ''}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium mb-8">
              <span className="flex items-center gap-1.5 bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-md"><MapPin className="w-4 h-4 text-[#cd792f]" /> СНГ</span>
              <span className="flex items-center gap-1.5 bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-md"><Music className="w-4 h-4 text-[#cd792f]" /> PLATINUM ERA MUSIC</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row items-center justify-center gap-3 w-full max-w-sm">
              {profile?.isMe ? (
                <Link href="/artist/profile" className="w-full">
                  <Button className="w-full px-8 shadow-sm rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-14 text-base" variant="secondary">
                    <Settings className="w-5 h-5 mr-2"/> Настройки профиля
                  </Button>
                </Link>
              ) : (
                <Button 
                  className={cn("w-full px-10 shadow-lg rounded-full transition-all h-14 font-semibold text-base", profile?.isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-[#cd792f] hover:bg-[#b8661f] text-white")} 
                  onClick={handleFollow} 
                >
                  {profile?.isFollowing ? "Отписаться" : "Подписаться"}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full shadow-sm h-14 w-14 bg-secondary text-secondary-foreground hover:bg-secondary/80 shrink-0"><MoreHorizontal className="w-6 h-6" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl">
                  <DropdownMenuItem onClick={copyProfileLink} className="rounded-xl py-2"><Share2 className="w-4 h-4 mr-2" /> Поделиться</DropdownMenuItem>
                  {!profile?.isMe && <DropdownMenuItem onClick={handleReport} className="text-red-500 rounded-xl py-2"><Flag className="w-4 h-4 mr-2" /> Пожаловаться</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">
          
          {/* Left Column - Stats & Bio */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 bg-secondary/30 p-5 rounded-3xl border border-border/40 text-center">
                <div className="text-3xl font-black text-foreground">{profile?.followersCount || 0}</div>
                <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Подписчиков</div>
              </div>
              <div className="flex-1 bg-secondary/30 p-5 rounded-3xl border border-border/40 text-center">
                <div className="text-3xl font-black text-foreground">{profile?.followingCount || 0}</div>
                <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Подписок</div>
              </div>
            </div>

            <div className="bg-secondary/30 p-6 rounded-3xl border border-border/40">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="w-1.5 h-5 bg-[#cd792f] rounded-full"></span> Описание</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {profile?.bio || "Этот артист предпочитает говорить через свою музыку. Описание пока не добавлено."}
              </p>
              {profile?.isMe && !profile?.bio && (
                <Link href="/artist/profile"><Button variant="link" className="px-0 mt-2 text-[#cd792f] h-auto p-0">Добавить описание</Button></Link>
              )}
            </div>
          </div>
          
          {/* Right Column - Posts & Music */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none p-0 h-auto gap-8 mb-6">
                <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#cd792f] rounded-none px-2 py-4 text-base font-semibold transition-none">
                  <GridIcon className="w-4 h-4 mr-2" /> Публикации
                </TabsTrigger>
                <TabsTrigger value="music" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#cd792f] rounded-none px-2 py-4 text-base font-semibold transition-none">
                  <Music className="w-4 h-4 mr-2" /> Релизы
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="outline-none space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="border-none shadow-md overflow-hidden bg-secondary/10 hover:bg-secondary/20 transition-colors rounded-3xl">
                      <CardContent className="p-0">
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border shadow-sm">
                              <AvatarImage src={profile?.avatarUrl || ''} className="object-cover" />
                              <AvatarFallback>{(profile?.artistName || "A")?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-sm leading-none flex items-center gap-1">{profile?.artistName || profile?.name}{profile?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />}</h4>
                              <span className="text-xs text-muted-foreground mt-1 block">
                                {post?.createdAt ? String(post.createdAt).split("T")[0] : ""}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-secondary"><MoreHorizontal className="w-5 h-5" /></Button>
                        </div>
                        
                        {post.content && (
                          <div className="px-5 pb-4 text-[15px] whitespace-pre-wrap text-foreground/90 leading-relaxed">
                            {post.content}
                          </div>
                        )}
                        
                        {post.imageUrl && (
                          <div className="w-full max-h-[600px] bg-black/5 flex items-center justify-center cursor-pointer border-y border-border/30" onClick={() => setViewerImage(post.imageUrl)}>
                            <img src={post.imageUrl} className="w-full max-h-[600px] object-cover" alt="Post" loading="lazy" />
                          </div>
                        )}
                        
                        <div className="p-3 px-5 flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className={cn("rounded-full px-4 font-semibold transition-colors", post.hasLiked ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-muted-foreground hover:bg-secondary')} onClick={() => handleLike(post.id)}>
                              <Heart className={cn("w-5 h-5 mr-2", post.hasLiked && "fill-current")} /> 
                              {post.likesCount || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground font-semibold hover:bg-secondary" onClick={() => toast.info("Комментарии в разработке")}>
                              <MessageSquare className="w-5 h-5 mr-2" /> 0
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground font-semibold hover:bg-secondary" onClick={() => { navigator.clipboard.writeText(window.location.origin + "/artist/network/" + (profile?.username || profile?.uid || '')); toast.success("Ссылка скопирована!"); }}>
                              <Share2 className="w-5 h-5" />
                            </Button>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">{post.viewsCount} просмотров</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/50">
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                      <GridIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold">Нет публикаций</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">Артист пока не сделал ни одной записи. Следите за обновлениями!</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="music" className="pt-6 outline-none">
                <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/50">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold">Дискография скрыта</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">Отображение релизов на странице профиля появится в ближайшее время.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {viewerImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-xl" onClick={() => setViewerImage(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          <img src={viewerImage} className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
