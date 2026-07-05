"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, AlertTriangle, Send, MoreVertical, Pause, Play , BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryViewerProps {
  groupedStories: any[];
  initialGroupIndex: number;
  onClose: () => void;
}

export function StoryViewer({ groupedStories, initialGroupIndex, onClose }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentGroup = groupedStories[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const STORY_DURATION = 5000; // 5s for images

  useEffect(() => {
    setProgress(0);
  }, [groupIndex, storyIndex]);

  useEffect(() => {
    if (!currentStory) return onClose();
    if (isPaused) return;

    let timer: NodeJS.Timeout;
    
    if (currentStory.mediaType === 'image') {
      const step = 50; // Update every 50ms
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev + step >= STORY_DURATION) {
            handleNext();
            return 0;
          }
          return prev + step;
        });
      }, step);
    } else if (currentStory.mediaType === 'video' && videoRef.current) {
      // Progress handled by video timeupdate event
    }

    return () => clearInterval(timer);
  }, [currentStory, isPaused]);

  const handleNext = () => {
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(s => s + 1);
    } else if (groupIndex < groupedStories.length - 1) {
      setGroupIndex(g => g + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(s => s - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(g => g - 1);
      setStoryIndex(groupedStories[groupIndex - 1].stories.length - 1);
    }
  };

  const handleLike = async () => {
    toast.success("Вы лайкнули историю!");
    fetch("/api/social/stories/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: currentStory.id })
    }).catch(()=>{});
  };

  const handleReport = async () => {
    toast.success("Жалоба отправлена модераторам");
    fetch("/api/social/stories/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: currentStory.id, reason: "Неприемлемый контент" })
    }).catch(()=>{});
    handleNext();
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
         onMouseDown={() => setIsPaused(true)}
         onMouseUp={() => setIsPaused(false)}
         onTouchStart={() => setIsPaused(true)}
         onTouchEnd={() => setIsPaused(false)}>
      
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2 bg-gradient-to-b from-black/50 to-transparent">
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
      <div className="absolute top-4 left-0 right-0 z-50 p-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-white/20">
            <AvatarImage src={currentGroup.avatarUrl} />
            <AvatarFallback className="text-black bg-white">{(currentGroup.artistName || "A").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="drop-shadow-md">
            <p className="font-semibold text-sm flex items-center gap-1">{currentGroup.artistName}{currentGroup.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}</p>
            <p className="text-xs text-white/70">{formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true, locale: ru })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPaused && <Pause className="w-5 h-5 text-white drop-shadow-md mr-2" />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onMouseDown={e => e.stopPropagation()}>
                <MoreVertical className="w-5 h-5 drop-shadow-md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-white">
              <DropdownMenuItem onClick={handleReport} className="text-red-400 focus:text-red-300 focus:bg-neutral-800 cursor-pointer">
                <AlertTriangle className="w-4 h-4 mr-2" /> Пожаловаться
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose} onMouseDown={e => e.stopPropagation()}>
            <X className="w-6 h-6 drop-shadow-md" />
          </Button>
        </div>
      </div>

      {/* Media Content */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
        <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handleNext(); }} />

        {currentStory.mediaType === 'image' ? (
          <img src={currentStory.mediaUrl} className="max-w-full max-h-full object-contain" alt="Story" />
        ) : (
          <video 
            ref={videoRef}
            src={currentStory.mediaUrl} 
            className="max-w-full max-h-full object-contain" 
            autoPlay 
            playsInline
            muted={false}
            onEnded={handleNext}
            onTimeUpdate={() => setProgress(prev => prev + 1)} // force re-render for progress bar
          />
        )}

        {/* Text Overlay */}
        {currentStory.textOverlay && (
          <div className="absolute z-30 max-w-[80%] text-center px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-xl text-lg font-medium drop-shadow-xl pointer-events-none">
            {currentStory.textOverlay}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent flex gap-3 items-center" onMouseDown={e => e.stopPropagation()}>
        <div className="flex-1 bg-white/20 rounded-full flex items-center px-4 py-2 backdrop-blur-md border border-white/10">
          <input 
            type="text" 
            placeholder="Ответить на историю..." 
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/60"
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                toast.success("Ответ отправлен");
                e.currentTarget.value = "";
              }
            }}
          />
          <Send className="w-4 h-4 text-white/60" />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 shrink-0" onClick={handleLike}>
          <Heart className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
