"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal, Share2, Grid as GridIcon, Heart, MessageSquare, X, MapPin, Link as LinkIcon, Flag, Music, Settings, Crown, BadgeCheck, Mail } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() { if (this.state.hasError) return <div className="p-12 text-center text-red-500">Render Error</div>; return this.props.children; }
}

export default function ArtistProfilePage() {
  return <ErrorBoundary><ProfileContent /></ErrorBoundary>;
}

function renderOnlineStatus(dateStr: string | null | undefined) {
  if (!dateStr) return <span className="text-muted-foreground text-xs font-medium">Был(а) недавно</span>;
  try {
    const lastActive = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - lastActive) / (1000 * 60));
    
    if (diffMins < 5) {
      return (
        <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500 text-xs font-bold uppercase tracking-wider">В сети</span>
        </div>
      );
    }
    
    let text = "Был(а) в сети: ";
    if (diffMins < 60) text += `${diffMins} мин. назад`;
    else if (diffMins < 24 * 60) text += `${Math.floor(diffMins / 60)} ч. назад`;
    else text += `${Math.floor(diffMins / (24 * 60))} дн. назад`;
    
    return <span className="text-muted-foreground text-xs font-medium">{text}</span>;
  } catch(e) {
    return <span className="text-muted-foreground text-xs font-medium">Был(а) недавно</span>;
  }
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
      const timer = setTimeout(() => setShowIntro(false), 4000);
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

  useEffect(() => { loadData(); }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const res = await fetch("/api/social/follow", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profile?.id })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile, isFollowing: data.following, followersCount: (profile?.followersCount || 0) + (data.following ? 1 : -1) });
        toast.success(data.following ? "Вы подписались" : "Вы отписались");
      }
    } catch(e) {}
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch("/api/social/posts/like", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId })
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => p.id === postId ? { ...p, hasLiked: data.liked, likesCount: p.likesCount + (data.liked ? 1 : -1) } : p));
      }
    } catch(e) {}
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/artist/network/" + (profile?.username || profile?.uid || ''));
    toast.success("Ссылка скопирована!");
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><img src="/logo.png" className="w-16 h-16 animate-pulse object-contain" /></div>;
  if (!profile) return <div className="text-center p-12 text-muted-foreground">Артист не найден</div>;

  return (
    <>
      {showIntro && profile?.customBadge && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-out fade-out duration-1000 delay-[3000ms] fill-mode-forwards">
          <div className="relative flex items-center justify-center mb-8">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${profile?.exclusiveColor || 'from-amber-400 to-rose-600'} animate-[spin_2s_linear_infinite] blur-[40px] opacity-80 w-64 h-64 -m-20`} />
            <Crown className="w-32 h-32 text-red-500 relative z-10 animate-bounce drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
          </div>
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 animate-pulse uppercase tracking-[0.2em] drop-shadow-2xl text-center">
            {profile.customBadge}
          </h2>
        </div>
      )}

      <div className="min-h-screen bg-background relative animate-in fade-in duration-500 pb-24 md:pb-12">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 fixed top-0 w-full z-40">
          <Button variant="secondary" size="icon" onClick={() => router.push("/artist/network")} className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-xl border-none">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-xl border-none"><MoreHorizontal className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={copyProfileLink} className="rounded-xl"><Share2 className="w-4 h-4 mr-2" /> Поделиться</DropdownMenuItem>
              {!profile?.isMe && <DropdownMenuItem onClick={() => toast.success("Жалоба отправлена")} className="text-red-500 rounded-xl"><Flag className="w-4 h-4 mr-2" /> Пожаловаться</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center p-6 absolute top-0 left-0 z-40 w-full justify-between">
          <Button variant="secondary" className="rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border-none" onClick={() => router.push("/artist/network")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Назад
          </Button>
        </div>

        {/* Cover Section */}
        <div className="relative h-64 md:h-80 w-full">
          {profile?.coverUrl ? (
            <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${profile?.exclusiveColor || 'from-neutral-800 to-neutral-900'}`} />
          )}
          {/* Soft fade out to background */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="max-w-4xl mx-auto px-6 relative z-10 -mt-20">
          
          {/* Squircle Avatar */}
          <div className="relative inline-block drop-shadow-2xl">
            {profile?.isExclusive && (
              <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 animate-[spin_3s_linear_infinite] -m-1" />
            )}
            <Avatar className="w-28 h-28 sm:w-36 sm:h-36 !rounded-[2rem] border-[6px] border-background bg-muted relative z-10">
              <AvatarImage src={profile?.avatarUrl || ''} className="object-cover !rounded-[1.7rem]" />
              <AvatarFallback className="text-4xl md:text-5xl font-light !rounded-[1.7rem]">{(profile?.artistName || profile?.name || "A")?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Header Row (Name & Buttons) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
                {profile?.artistName || profile?.name}
                {profile?.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0" />}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-muted-foreground font-medium text-lg">@{profile?.username || profile?.uid || ''}</p>
                {profile?.customBadge && (
                  <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-red-500/20 flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3" /> {profile.customBadge}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile?.isMe ? (
                <Link href="/artist/profile">
                  <Button variant="secondary" className="rounded-full px-8 font-bold h-12 bg-white/10 hover:bg-white/20">Настройки</Button>
                </Link>
              ) : (
                <>
                  <Button variant="secondary" size="icon" className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 shrink-0" onClick={() => toast.success("Сообщения в разработке")}>
                    <Mail className="w-5 h-5" />
                  </Button>
                  <Button 
                    className={cn("rounded-full px-8 font-bold h-12 transition-all", profile?.isFollowing ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-black hover:bg-neutral-200")} 
                    onClick={handleFollow}
                  >
                    {profile?.isFollowing ? "Отписаться" : "Подписаться"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-6 pb-6 border-b border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg">{profile?.followingCount || 0}</span>
              <span className="text-muted-foreground text-sm">Подписок</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg">{profile?.followersCount || 0}</span>
              <span className="text-muted-foreground text-sm">Подписчиков</span>
            </div>
            <div className="ml-auto">
              {renderOnlineStatus(profile?.lastActiveAt)}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap max-w-3xl">
              {profile?.bio || "Этот артист предпочитает говорить через свою музыку. Описание пока не добавлено."}
            </p>
          </div>

          {/* Content Tabs */}
          <div className="mt-10">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border/30 rounded-none p-0 h-auto gap-8 mb-6">
                <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-2 py-4 text-base font-semibold transition-none">
                  <GridIcon className="w-4 h-4 mr-2" /> Публикации
                </TabsTrigger>
                <TabsTrigger value="music" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-2 py-4 text-base font-semibold transition-none text-muted-foreground data-[state=active]:text-foreground">
                  <Music className="w-4 h-4 mr-2" /> Релизы
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="outline-none space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="border-none shadow-md overflow-hidden bg-white/5 hover:bg-white/10 transition-colors rounded-3xl backdrop-blur-xl">
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
                          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-white/10"><MoreHorizontal className="w-5 h-5" /></Button>
                        </div>
                        
                        {post.content && (
                          <div className="px-5 pb-4 text-[15px] whitespace-pre-wrap text-foreground/90 leading-relaxed">
                            {post.content}
                          </div>
                        )}
                        
                        {post.imageUrl && (
                          <div className="w-full max-h-[600px] bg-black/20 flex items-center justify-center cursor-pointer border-y border-white/5" onClick={() => setViewerImage(post.imageUrl)}>
                            <img src={post.imageUrl} className="w-full max-h-[600px] object-cover" alt="Post" loading="lazy" />
                          </div>
                        )}
                        
                        <div className="p-3 px-5 flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className={cn("rounded-full px-4 font-semibold transition-colors bg-white/5", post.hasLiked ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-white hover:bg-white/10')} onClick={() => handleLike(post.id)}>
                              <Heart className={cn("w-5 h-5 mr-2", post.hasLiked && "fill-current")} /> 
                              {post.likesCount || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full px-4 text-white font-semibold bg-white/5 hover:bg-white/10" onClick={() => toast.info("Комментарии в разработке")}>
                              <MessageSquare className="w-5 h-5 mr-2" /> 0
                            </Button>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">{post.viewsCount} просмотров</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <GridIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold">Нет публикаций</h3>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="music" className="pt-6 outline-none">
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold">Дискография скрыта</h3>
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
