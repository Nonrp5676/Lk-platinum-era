"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, ImageIcon, Type, Wand2, Loader2, Video, SwitchCamera, CircleDot, Play , ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StoryCreator({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [mode, setMode] = useState<'init' | 'camera' | 'preview'>('init');
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Editor state
  const [text, setText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState({ x: 50, y: 50 }); // percentages
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const filters = [
    { name: "Normal", value: "" },
    { name: "Sepia", value: "sepia(80%)" },
    { name: "B&W", value: "grayscale(100%)" },
    { name: "Contrast", value: "contrast(150%) saturate(120%)" },
    { name: "Blur", value: "blur(4px)" },
    { name: "Invert", value: "invert(100%)" },
    { name: "Warm", value: "sepia(50%) hue-rotate(30deg) saturate(140%)" },
    { name: "Cool", value: "hue-rotate(180deg) saturate(120%)" },
  ];

  useEffect(() => {
    if (!isOpen) reset();
    else if (mode === 'init') startCamera();
  }, [isOpen]);

  const startCamera = async () => {
    stopCamera();
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setMode('camera');
    } catch (e) {
      toast.error("Нет доступа к камере. Используйте галерею.");
      setMode('init');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    setFacingMode(p => p === 'user' ? 'environment' : 'user');
    setTimeout(startCamera, 200);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        setFile(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
        setMediaType('image');
        setMode('preview');
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      setFile(new File([blob], 'video.mp4', { type: 'video/mp4' }));
      setMediaType('video');
      setMode('preview');
      stopCamera();
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 50 * 1024 * 1024) return toast.error("Максимальный размер файла - 50МБ");
      setFile(f);
      setMediaType(f.type.startsWith('video/') ? 'video' : 'image');
      setMode('preview');
      stopCamera();
    }
  };

  const handleDrag = (e: React.TouchEvent | React.MouseEvent) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setTextPos({ x, y });
  };

  const handlePublish = async () => {
    if (!file) return;
    setUploading(true);
    
    const overlayData = JSON.stringify({ text, x: textPos.x, y: textPos.y, filter });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("textOverlay", overlayData);

    try {
      const res = await fetch("/api/social/stories", { method: "POST", body: formData });
      if (res.ok) {
        toast.success("История опубликована!");
        reset();
        onSuccess();
        onClose();
      } else throw new Error();
    } catch(e) {
      toast.error("Ошибка публикации");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null); setText(""); setFilter(""); setShowFilters(false);
    setTextPos({ x: 50, y: 50 }); setMode('init'); stopCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black text-white border-zinc-900 h-[100dvh] md:h-[80vh] flex flex-col rounded-none md:rounded-3xl select-none" style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}>
        
        {mode === 'init' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mb-4" />
            <p className="text-zinc-400">Доступ к камере...</p>
            <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleGallery} />
            <Button variant="outline" className="mt-8 bg-zinc-900 border-zinc-800 text-white" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" /> Открыть галерею
            </Button>
          </div>
        )}

        {mode === 'camera' && (
          <div className="flex-1 relative flex flex-col bg-black overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-black/20 text-white hover:bg-black/40"><X className="w-6 h-6" /></Button>
              {isRecording && <div className="px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">REC</div>}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent z-10 pb-safe">
              <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleGallery} />
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-6 h-6" />
              </Button>
              
              <button 
                className={cn("w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all select-none", isRecording ? "border-red-500 scale-110" : "border-white")}
                onPointerDown={startRecording}
                style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", touchAction: "none" }}
                onPointerUp={stopRecording}
                onPointerLeave={stopRecording}
                onClick={takePhoto}
              >
                <div className={cn("rounded-full transition-all", isRecording ? "w-8 h-8 bg-red-500 rounded-sm" : "w-16 h-16 bg-white")} />
              </button>

              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" onClick={toggleCamera}>
                <SwitchCamera className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {mode === 'preview' && file && (
          <div className="flex-1 relative flex flex-col bg-zinc-950 overflow-hidden" ref={previewContainerRef}>
            
            {/* Preview Media */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ filter }}>
              {mediaType === 'video' ? (
                <video src={URL.createObjectURL(file)} autoPlay loop playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Draggable Text */}
            {text && !showTextInput && (
              <div 
                style={{ left: `${textPos.x}%`, top: `${textPos.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-40 text-center px-4 py-2 bg-black/40 backdrop-blur-sm text-white rounded-2xl text-2xl font-bold drop-shadow-2xl whitespace-pre-wrap cursor-move touch-none"
                onTouchMove={handleDrag}
                onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
                onClick={() => setShowTextInput(true)}
              >
                {text}
              </div>
            )}

            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-50">
              <Button variant="ghost" size="icon" onClick={() => {setMode('camera'); startCamera();}} className="rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"><ArrowLeft className="w-5 h-5" /></Button>
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn("rounded-full text-white backdrop-blur-md", showFilters ? "bg-white/30" : "bg-black/40 hover:bg-black/60")}><Wand2 className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setShowTextInput(true)} className="rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"><Type className="w-5 h-5" /></Button>
              </div>
            </div>

            {/* Text Input Overlay */}
            {showTextInput && (
              <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="w-full bg-transparent text-white text-3xl font-bold text-center resize-none outline-none placeholder:text-white/30"
                  placeholder="Введите текст..."
                  rows={4}
                />
                <Button className="absolute top-6 right-6 text-black bg-white rounded-full font-bold px-6" onClick={() => setShowTextInput(false)}>Готово</Button>
              </div>
            )}

            {/* Filters Slider */}
            {showFilters && !showTextInput && (
              <div className="absolute bottom-24 left-0 right-0 z-40 bg-black/60 backdrop-blur-lg p-4 overflow-x-auto flex gap-3 scrollbar-hide snap-x">
                {filters.map((f, i) => (
                  <button key={i} onClick={() => setFilter(f.value)} className={cn("snap-center shrink-0 w-16 flex flex-col items-center gap-2", filter === f.value ? "opacity-100" : "opacity-50 hover:opacity-100")}>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 relative" style={{ filter: f.value }}>
                      {mediaType === 'image' ? <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-500" />}
                    </div>
                    <span className="text-[10px] font-medium text-white">{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent z-30 pb-safe">
              <span className="text-xs text-white/70 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">Будет доступно 24 часа</span>
              <Button onClick={handlePublish} disabled={uploading} className="bg-[#cd792f] hover:bg-[#b8661f] text-white px-8 rounded-full h-12 text-base font-bold shadow-xl">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {uploading ? "Публикация..." : "В историю >"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
