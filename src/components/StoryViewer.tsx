
"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Heart, Send, MoreVertical, Pause, Play, Volume2, VolumeX, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

interface StoryViewerProps {
  groupedStories: any[];
  initialGroupIndex: number;
  onClose: () => void;
}

export function StoryViewer({ groupedStories, initialGroupIndex, onClose }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);

  const currentGroup = groupedStories[groupIndex];
  const currentStory = currentGroup?.stories?.[storyIndex];

  const handleNext = () => {
    if (!currentGroup || !currentGroup.stories) return onClose();
    if (storyIndex < currentGroup.stories.length - 1) setStoryIndex(s => s + 1);
    else if (groupIndex < groupedStories.length - 1) { setGroupIndex(g => g + 1); setStoryIndex(0); }
    else onClose();
  };

  const handlePrev = () => {
    if (storyIndex > 0) setStoryIndex(s => s - 1);
    else if (groupIndex > 0) { setGroupIndex(g => g - 1); setStoryIndex(groupedStories[groupIndex - 1].stories.length - 1); }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col select-none touch-none w-screen h-[100dvh] overflow-hidden">
      
      <div className="absolute top-4 left-0 right-0 z-50 p-4 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-semibold text-sm drop-shadow-md">{currentGroup.artistName}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose} onMouseDown={e => e.stopPropagation()}>
          <X className="w-7 h-7 drop-shadow-md" />
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handleNext(); }} />

        {currentStory.mediaType === 'image' ? (
          <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt="Story" />
        ) : (
          <video src={currentStory.mediaUrl} className="w-full h-full object-cover" autoPlay playsInline muted loop />
        )}
      </div>

    </div>
  );
}
