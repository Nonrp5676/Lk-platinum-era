"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Heart, AlertTriangle, Send, MoreVertical, Pause, Play, BadgeCheck, Volume2, VolumeX, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/useUser";

interface StoryViewerProps {
  groupedStories: any[];
  initialGroupIndex: number;
  onClose: () => void;
}

export function StoryViewer({ groupedStories, initialGroupIndex, onClose }: StoryViewerProps) {
  const { user } = useUser();
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({ views: [], likes: [] });
  
  const currentGroup = groupedStories[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isMyStory = user && (currentGroup?.artistId === user.id || currentGroup?.username === user.username || currentGroup?.uid === user.uid);
  
  const STORY_DURATION = 5000;


  useEffect(() => {
    if (videoRef.current) {
      if (isPaused || showStats) videoRef.current.pause();
      else videoRef.current.play();
    }
  }, [isPaused, showStats]);


  useEffect(() => { 
    setProgress(0); 
    setShowStats(false);
  }, [groupIndex, storyIndex]);

  useEffect(() => {
    if (!currentStory) {
      onClose();
      return;
    }

    // Record view if not my story
    if (!isMyStory) {
      fetch("/api/social/stories/view", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: currentStory.id })
      }).catch(()=>{});
    } else {
      // Fetch stats for my story
      fetch(`/api/social/stories/${currentStory.id}/stats`)
        .then(r => r.json())
        .then(d => {
           if(d.views) setStats({ views: d.views, likes: d.likes });
        }).catch(()=>{});
    }

    if (isPaused || showStats) return;

    let timer: NodeJS.Timeout;
    if (currentStory.mediaType === 'image') {
      const step = 50;
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev + step >= STORY_DURATION) { handleNext(); return 0; }
          return prev + step;
        });
      }, step);
    }
    return () => clearInterval(timer);
  }, [currentStory, isPaused, showStats]);

  const handleNext = () => {
    if (storyIndex < currentGroup.stories.length - 1) setStoryIndex(s => s + 1);
    else if (groupIndex < groupedStories.length - 1) { setGroupIndex(g => g + 1); setStoryIndex(0); }
    else onClose();
  };

  const handlePrev = () => {
    if (storyIndex > 0) setStoryIndex(s => s - 1);
    else if (groupIndex > 0) { setGroupIndex(g => g - 1); setStoryIndex(groupedStories[groupIndex - 1].stories.length - 1); }
  };

  const handleLike = () => {
    toast.success("Вы оценили историю");
    fetch("/api/social/stories/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: currentStory.id })
    }).catch(()=>{});
  };

  if (!currentStory) return null;

  let overlay = { text: currentStory.textOverlay, x: 50, y: 50, filter: "" };
  try {
    if (currentStory.textOverlay?.startsWith('{')) {
      const parsed = JSON.parse(currentStory.textOverlay);
      overlay = { ...overlay, ...parsed };
    }
  } catch(e) {}

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col select-none touch-none w-screen h-[100dvh] overflow-hidden" style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
         onMouseDown={() => !showStats && setIsPaused(true)} onMouseUp={() => !showStats && setIsPaused(false)}
         onTouchStart={() => !showStats && setIsPaused(true)} onTouchEnd={() => !showStats && setIsPaused(false)}>
      
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2 bg-gradient-to-b from-black/60 to-transparent pt-safe">
        {currentGroup.stories.map((s: any, idx: number) => {
          let w = 0;
          if (idx < storyIndex) w = 100;
          else if (idx === storyIndex) {
             if (s.mediaType === 'image') w = (progress / STORY_DURATION) * 100;
             else if (videoRef.current) w = (videoRef.current.currentTime / videoRef.current.duration) * 100 || 0;
          }
          return (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-75" style={{ width: `${w}%` }} />
            </div>
          )
        })}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-50 p-4 pt-8 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-white/20">
            <AvatarImage src={currentGroup.avatarUrl} className="object-cover" />
            <AvatarFallback className="text-black bg-white">{(currentGroup.artistName || "A").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="drop-shadow-md">
            <p className="font-semibold text-sm flex items-center gap-1">{currentGroup.artistName}{currentGroup.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</p>
            <p className="text-xs text-white/70">
              {currentStory.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString("ru-RU", {hour: '2-digit', minute:'2-digit'}) : ""}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          {isPaused && !showStats && <Pause className="w-5 h-5 text-white drop-shadow-md mr-2" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onMouseDown={e => e.stopPropagation()}>
                <MoreVertical className="w-5 h-5 drop-shadow-md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-white">
              {isMyStory ? (
                <DropdownMenuItem onClick={() => toast.success("Удаление в разработке")} className="text-red-400 focus:text-red-300 focus:bg-neutral-800 cursor-pointer">
                  <X className="w-4 h-4 mr-2" /> Удалить историю
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => toast.success("Жалоба отправлена модераторам")} className="text-red-400 focus:text-red-300 focus:bg-neutral-800 cursor-pointer">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Пожаловаться
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose} onMouseDown={e => e.stopPropagation()}>
            <X className="w-7 h-7 drop-shadow-md" />
          </Button>
        </div>
      </div>

      {/* Media Content */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
        
        {currentStory.mediaType === 'video' && (
          <Button variant="ghost" size="icon" className="absolute top-20 right-4 z-50 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md pointer-events-auto" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        )}

        {currentStory.mediaType === 'image' ? (
          <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt="Story" style={{ filter: overlay.filter }} />
        ) : (
          <video 
            ref={videoRef} src={currentStory.mediaUrl} className="w-full h-full object-cover" autoPlay playsInline muted={isMuted}
            onEnded={handleNext} onTimeUpdate={() => setProgress(prev => prev + 1)} style={{ filter: overlay.filter }}
          />
        )}

        {overlay.text && (
          <div 
            className="absolute z-30 text-center px-4 py-2 bg-black/40 backdrop-blur-sm text-white rounded-2xl text-2xl font-bold drop-shadow-2xl whitespace-pre-wrap pointer-events-none"
            style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {overlay.text}
          </div>
        )}
      </div>

      {/* Footer */}
      {isMyStory ? (
        <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowStats(true)}>
            <div className="flex -space-x-2">
              {stats.views.length === 0 ? (
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
                  <Eye className="w-4 h-4 text-white/70" />
                </div>
              ) : (
                stats.views.slice(0, 3).map((v: any, i: number) => (
                  <Avatar key={i} className="w-8 h-8 border-2 border-black">
                    <AvatarImage src={v.avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-[10px]">{(v.artistName || v.name || "A").charAt(0)}</AvatarFallback>
                  </Avatar>
                ))
              )}
            </div>
            <span className="text-xs font-medium drop-shadow-md">Действия</span>
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5 backdrop-blur-md border border-white/10">
            <Heart className="w-4 h-4 text-white/70" />
            <span className="text-sm font-semibold">{stats.likes.length}</span>
            <div className="w-px h-3 bg-white/20 mx-1" />
            <Eye className="w-4 h-4 text-white/70" />
            <span className="text-sm font-semibold">{stats.views.length}</span>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-gradient-to-t from-black/80 to-transparent flex gap-3 items-center pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
          <div className="flex-1 bg-white/20 rounded-full flex items-center px-4 py-3 backdrop-blur-xl border border-white/10">
            <input 
              type="text" placeholder="Ответить на историю..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/60"
              onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { toast.success("Ответ отправлен"); e.currentTarget.value = ""; } }}
            />
            <Send className="w-4 h-4 text-white/60" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 shrink-0 h-11 w-11" onClick={handleLike}>
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Bottom Sheet for Stats */}
      {showStats && (
        <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex flex-col justify-end pointer-events-auto" onClick={(e) => { e.stopPropagation(); setShowStats(false); }}>
          <div className="bg-zinc-900 w-full h-[60vh] rounded-t-3xl flex flex-col pointer-events-auto border-t border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setShowStats(false)}>
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
            </div>
            
            <div className="px-6 pb-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-zinc-400" /> Просмотры ({stats.views.length})
              </h3>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full" onClick={() => setShowStats(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {stats.views.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <Eye className="w-12 h-12 mb-2 opacity-20" />
                  <p>Пока нет просмотров</p>
                </div>
              ) : (
                stats.views.map((v: any) => {
                  const hasLiked = stats.likes.some((l: any) => l.artistId === v.artistId);
                  return (
                    <div key={v.artistId} className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border border-zinc-700">
                          <AvatarImage src={v.avatarUrl} className="object-cover" />
                          <AvatarFallback className="text-zinc-400 bg-zinc-800">{(v.artistName || v.name || "A").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1">{v.artistName || v.name}{v.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />}</p>
                          {v.username && <p className="text-xs text-zinc-500">@{v.username}</p>}
                        </div>
                      </div>
                      {hasLiked && <Heart className="w-5 h-5 text-red-500 fill-current drop-shadow-md" />}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
}
