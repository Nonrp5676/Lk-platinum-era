"use client";
import { useEffect, useState, useRef } from "react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryCreator } from "@/components/StoryCreator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, MoreHorizontal, MessageSquare, Share2, Heart, X , BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export default function FeedPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [stories, setStories] = useState<any[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);
  
  const loadStories = async () => {
    try {
      const res = await fetch("/api/social/stories");
      const data = await res.json();
      setStories(data.grouped || []);
    } catch(e) {}
  };

  useEffect(() => {
    loadStories();
  }, []);

  
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/social/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePost = async () => {
    if (!content.trim() && !image) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setContent("");
        setImage(null);
        toast.success("Пост опубликован!");
        loadPosts();
      } else {
        toast.error("Ошибка при публикации");
      }
    } catch(e) {
      toast.error("Ошибка сети");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Лента</h1>
      </div>

      {/* Stories Banner */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]" onClick={() => setIsCreatorOpen(true)}>
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors relative">
            <Camera className="w-6 h-6 text-muted-foreground" />
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-background">+</div>
          </div>
          <span className="text-xs font-medium">Ваша история</span>
        </div>
        
        {stories.map((group, idx) => (
          <div key={group.artistId} className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]" onClick={() => setViewerGroupIndex(idx)}>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <StoryRing count={group.stories?.length || 1} />
              <Avatar className="w-[58px] h-[58px] border-2 border-background relative z-10 shrink-0 aspect-square">
                <AvatarImage src={group.avatarUrl || ""} className="object-cover" />
                <AvatarFallback>{(group.artistName || "A")?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center flex items-center justify-center gap-0.5">{group.artistName}{group.isVerified && <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500/10 shrink-0" />}</span>
          </div>
        ))}
      </div>

      <StoryCreator isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} onSuccess={loadStories} />
      {viewerGroupIndex !== null && (
        <StoryViewer groupedStories={stories} initialGroupIndex={viewerGroupIndex} onClose={() => setViewerGroupIndex(null)} />
      )}


      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="shrink-0 aspect-square">
              <AvatarImage src={user?.avatarUrl || ""} className="object-cover" />
              <AvatarFallback>{user?.name?.charAt(0) || "A" || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-transparent resize-none outline-none placeholder:text-muted-foreground min-h-[60px]" 
                placeholder="Что нового в вашем творчестве?"
              />
              
              {image && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" />
                  <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white"><X className="w-3 h-3" /></button>
                </div>
              )}
              
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => {
                    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
                  }} />
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4 mr-2" /> Фото
                  </Button>
                </div>
                <Button size="sm" className="h-8 bg-white text-black hover:bg-neutral-200 text-white" onClick={handlePost} disabled={submitting || (!content.trim() && !image)}>
                  {submitting ? "Публикация..." : "Опубликовать"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center p-12"><img src="/logo.png" alt="Loading" className="w-12 h-12 animate-pulse object-contain" /></div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between">
                  <Link href={`/artist/network/${post.username || post.uid}`} className="flex items-center gap-3 group">
                    <Avatar>
                      <AvatarImage src={post.avatarUrl || ""} className="object-cover" />
                      <AvatarFallback>{(post.artistName || post.name || "A")?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-sm leading-none group-hover:text-fuchsia-400 transition-colors flex items-center gap-1">{post.artistName || post.name}{post.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</h4>
                      <span className="text-xs text-muted-foreground">
                        {post?.createdAt ? String(post.createdAt).split("T")[0] : ""}
                      </span>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button>
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
                  <span className="text-xs text-muted-foreground">{post.viewsCount} {post.viewsCount === 1 ? 'просмотр' : 'просмотров'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && <div className="text-center text-muted-foreground p-8">Нет записей. Будьте первыми!</div>}
        </div>
      )}

      {/* Photo Viewer Modal */}
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


function StoryRing({ count }: { count: number }) {
  if (count <= 1) {
    return <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600" style={{ padding: '2px' }} />;
  }
  const r = 48;
  const c = 2 * Math.PI * r;
  const gap = 15;
  const segment = Math.max(0, (c - count * gap) / count);
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" style={{ padding: '1px' }}>
      <defs>
        <linearGradient id="story-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#cd792f" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <circle
        cx="50" cy="50" r="48"
        fill="none"
        stroke="url(#story-grad)"
        strokeWidth="3.5"
        strokeDasharray={`${segment} ${gap}`}
        strokeLinecap="round"
      />
    </svg>
  );
}
