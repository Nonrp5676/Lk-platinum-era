"use client";

import { useState, useRef } from "react";
import { Camera, X, ImageIcon, Type, Link as LinkIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function StoryCreator({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showText, setShowText] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    if (textOverlay) formData.append("textOverlay", textOverlay);
    if (linkUrl) formData.append("linkUrl", linkUrl);

    try {
      const res = await fetch("/api/social/stories", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        toast.success("История опубликована!");
        setFile(null);
        setTextOverlay("");
        setLinkUrl("");
        onSuccess();
        onClose();
      } else {
        toast.error("Ошибка при публикации истории");
      }
    } catch(e) {
      toast.error("Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black text-white border-zinc-800">
        {!file ? (
          <div className="h-[600px] flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <Camera className="w-12 h-12 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Создать историю</h2>
              <p className="text-zinc-400 text-sm">Поделитесь моментами из жизни с вашими подписчиками</p>
            </div>
            
            <input 
              type="file" 
              accept="image/*,video/mp4,video/quicktime" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  if (e.target.files[0].size > 50 * 1024 * 1024) {
                     return toast.error("Файл слишком большой (макс 50МБ)");
                  }
                  setFile(e.target.files[0]);
                }
              }} 
            />
            
            <Button size="lg" className="w-full bg-[#cd792f] hover:bg-[#b8661f]" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-5 h-5 mr-2" /> Выбрать фото или видео
            </Button>
          </div>
        ) : (
          <div className="relative h-[80vh] bg-zinc-900 flex flex-col">
            {/* Header Tools */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between bg-gradient-to-b from-black/60 to-transparent">
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-white hover:bg-white/20 rounded-full">
                <X className="w-6 h-6" />
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowText(!showText)} className={`text-white rounded-full ${showText ? 'bg-white/20' : 'hover:bg-white/20'}`}>
                  <Type className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowLink(!showLink)} className={`text-white rounded-full ${showLink ? 'bg-white/20' : 'hover:bg-white/20'}`}>
                  <LinkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Media Preview */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {file.type.startsWith('video/') ? (
                <video src={URL.createObjectURL(file)} className="w-full h-full object-contain" autoPlay loop muted playsInline />
              ) : (
                <img src={URL.createObjectURL(file)} className="w-full h-full object-contain" />
              )}

              {/* Text Overlay Preview */}
              {textOverlay && !showText && (
                <div className="absolute max-w-[80%] text-center px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-xl text-2xl font-bold drop-shadow-xl cursor-pointer" onClick={() => setShowText(true)}>
                  {textOverlay}
                </div>
              )}
            </div>

            {/* Editor Overlays */}
            {showText && (
              <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
                <textarea
                  autoFocus
                  value={textOverlay}
                  onChange={e => setTextOverlay(e.target.value)}
                  className="w-full bg-transparent text-white text-3xl font-bold text-center resize-none outline-none placeholder:text-white/30"
                  placeholder="Введите текст..."
                  rows={4}
                />
                <Button className="absolute top-6 right-6 text-white" variant="ghost" onClick={() => setShowText(false)}>Готово</Button>
              </div>
            )}

            {showLink && (
              <div className="absolute bottom-20 left-4 right-4 z-50 p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl">
                <p className="text-sm font-medium mb-2 text-zinc-300">Добавить ссылку в историю</p>
                <div className="flex gap-2">
                  <Input 
                    value={linkUrl} 
                    onChange={e => setLinkUrl(e.target.value)} 
                    placeholder="https://" 
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                  <Button variant="secondary" onClick={() => setShowLink(false)}>ОК</Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-black border-t border-zinc-800 flex justify-between items-center">
              <span className="text-xs text-zinc-500">Доступна 24 часа</span>
              <Button onClick={handlePublish} disabled={uploading} className="bg-[#cd792f] hover:bg-[#b8661f] text-white px-8 rounded-full">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {uploading ? "Публикация..." : "Ваша история >"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
