"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal, Share2, Grid, Edit, ShieldAlert, Heart, MessageSquare, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export default function ArtistProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const username = pathname.split('/').pop();
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

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
        body: JSON.stringify({ targetId: profile.id })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          ...profile,
          isFollowing: data.following,
          followersCount: profile.followersCount + (data.following ? 1 : -1)
        });
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

  if (loading) return <div className="flex justify-center p-12"><img src="/logo.png" alt="Loading" className="w-12 h-12 animate-pulse object-contain" /></div>;
  if (!profile) return <div className="text-center p-12">Артист не найден</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
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
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-4xl">{(profile.artistName || profile.name || "A").charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.artistName || profile.name}</h1>
              <p className="text-muted-foreground font-medium">@{profile.username}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Онлайн</span>
                <span>•</span>
                <span>Был(а) недавно</span>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              {profile.isMe ? (
                <Link href="/artist/profile" className="w-full sm:w-auto">
                  <Button className="w-full px-8" size="lg" variant="outline"><Edit className="w-4 h-4 mr-2"/> Управление профилем</Button>
                </Link>
              ) : (
                <Button className="w-full sm:w-auto px-8" size="lg" onClick={handleFollow} variant={profile.isFollowing ? "outline" : "default"}>
                  {profile.isFollowing ? "Отписаться" : "Подписаться"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">О себе</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio || "Пользователь пока не добавил описание."}</p>
              </div>
              
              <div className="flex gap-6 pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold">{profile.followersCount || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Подписчика</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.followingCount || 0}</div>
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
                {posts.map((post) => (
                  <Card key={post.id} className="border shadow-none">
                    <CardContent className="p-0">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={profile.avatarUrl} />
                            <AvatarFallback>{(profile.artistName || "A").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm leading-none">{profile.artistName || profile.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {post.content && (
                        <div className="px-4 pb-3 text-sm whitespace-pre-wrap">
                          {post.content}
                        </div>
                      )}
                      
                      {post.imageUrl && (
                        <div className="w-full bg-black flex items-center justify-center cursor-pointer" onClick={() => setViewerImage(post.imageUrl)}>
                          <img src={post.imageUrl} className="w-full max-h-[500px] object-contain" alt="Post" />
                        </div>
                      )}
                      
                      <div className="p-2 px-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className={`h-9 px-3 ${post.hasLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`} onClick={() => handleLike(post.id)}>
                            <Heart className={`w-4 h-4 mr-2 ${post.hasLiked ? 'fill-current' : ''}`} /> {post.likesCount || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground">
                            <MessageSquare className="w-4 h-4 mr-2" /> 0
                          </Button>
                          <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground">
                            <Share2 className="w-4 h-4 mr-2" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">{post.viewsCount} просмотров</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {posts.length === 0 && <p className="text-center text-muted-foreground py-12">Нет публикаций</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewerImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-sm" onClick={() => setViewerImage(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
            <X className="w-8 h-8" />
          </button>
          <img src={viewerImage} className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
