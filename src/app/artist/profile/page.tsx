"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import {
  Loader2, User as UserIcon, Mail, Shield, Award, Camera, Save,
  Settings, Calendar, MessageCircle, Send, Lock, AtSign,
  FileCheck2, FileX2, FileSignature, ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { hasAdvancedFeatures, getUserPlanName } from "@/lib/permissions";

export default function ArtistProfile() {
  const { user, loading, refreshUser } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSocial, setEditSocial] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditSurname(user.surname || "");
      setEditEmail(user.email || "");
      setEditSocial(user.socialNetwork || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

  // Fetch verification status
  useEffect(() => {
    if (user && !user.contractSigned) {
      fetch("/api/user/verification")
        .then((r) => r.json())
        .then((data) => {
          if (data.verification) {
            setVerificationStatus(data.verification.status || "draft");
          }
        })
        .catch(() => {});
    }
  }, [user]);

  
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 10 МБ)");
      return;
    }

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/cover", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Ошибка загрузки");
      }

      const data = await res.json();
      setUser({ ...user, coverUrl: data.coverUrl } as UserType);
      toast.success("Обложка успешно обновлена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка при загрузке обложки");
    } finally {
      setIsUploadingCover(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка загрузки");
        return;
      }
      toast.success("Аватар обновлён");
      refreshUser();
    } catch {
      toast.error("Ошибка подключения");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          surname: editSurname,
          email: editEmail,
          socialNetwork: editSocial,
          bio: editBio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка сохранения");
        return;
      }
      toast.success("Профиль обновлён");
      setIsEditing(false);
      refreshUser();
      router.refresh();
    } catch {
      toast.error("Ошибка подключения");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <img src="/logo.png" alt="Loading" className="w-12 h-12 animate-pulse object-contain" />
      </div>
    );
  }

  const planName = getUserPlanName(user);
  const isAdvanced = hasAdvancedFeatures(user);
  const regDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  }) : "—";

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Профиль</h1>
          <p className="text-muted-foreground">Управление вашим аккаунтом</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/artist/settings")} className="gap-2">
          <Settings className="w-4 h-4" /> Настройки
        </Button>
      </motion.div>

      {/* Profile header card with avatar & cover */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="overflow-hidden p-0 border-none bg-white/5 backdrop-blur-xl">
          
          {/* Cover Section */}
          <div className="relative h-48 md:h-64 w-full bg-neutral-900 group border-b border-white/10 rounded-t-[2rem]">
            {(user as any)?.coverUrl ? (
              <img src={(user as any).coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm cursor-pointer" onClick={() => coverInputRef.current?.click()}>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" ref={coverInputRef} onChange={handleCoverUpload} />
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white rounded-full pointer-events-none">
                {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                Изменить шапку профиля
              </Button>
            </div>
          </div>

          <CardContent className="px-6 pb-6 pt-0 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-muted ring-4 ring-background shadow-lg">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-fuchsia-600 to-[#b8661f] text-white text-4xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  title="Загрузить аватар"
                >
                  {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Name + nickname */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold">{user.artistName || user.name}</h2>
                  <Badge variant={isAdvanced ? "default" : "secondary"}>{planName}</Badge>
                </div>
                {user.artistName && user.artistName !== user.name && (
                  <p className="text-sm text-muted-foreground mt-1">{user.name} {user.surname}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                {user.telegramChatId && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-xs text-green-600">
                    <Send className="w-3.5 h-3.5" /> Telegram подключён
                  </div>
                )}
              </div>

              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 shrink-0">
                  <UserIcon className="w-4 h-4" /> Редактировать
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация об аккаунте</CardTitle>
            <CardDescription>
              {isEditing ? "Редактирование данных профиля" : "Основные данные вашего аккаунта"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Имя</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Имя" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Фамилия</Label>
                    <Input value={editSurname} onChange={(e) => setEditSurname(e.target.value)} placeholder="Фамилия" />
                  </div>
                </div>

                {/* Псевдоним — только для чтения */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Псевдоним (artist name)</Label>
                  <Input value={user.artistName || "—"} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Псевдоним назначается администратором и не может быть изменён</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><AtSign className="w-3.5 h-3.5" /> Социальные сети</Label>
                  <Input value={editSocial} onChange={(e) => setEditSocial(e.target.value)} placeholder="https://instagram.com/..., https://t.me/..." />
                </div>

                <div className="space-y-1.5">
                  <Label>Биография</Label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Расскажите о себе как об артисте..."
                    rows={4}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground">{editBio.length} / 5000 символов</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</> : <><Save className="w-4 h-4" /> Сохранить</>}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditing(false); refreshUser(); }}>
                    Отмена
                  </Button>
                </div>
              </>
            ) : (
              <>
                <InfoRow icon={UserIcon} label="Имя" value={`${user.name}${user.surname ? " " + user.surname : ""}`} />
                {user.artistName && <InfoRow icon={AtSign} label="Псевдоним" value={user.artistName} />}
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Shield} label="Лейбл" value={user.label} />
                <InfoRow icon={Award} label="Тарифный план" value={planName} />
                <InfoRow icon={Calendar} label="Дата регистрации" value={regDate} />
                {user.socialNetwork && (
                  <InfoRow icon={MessageCircle} label="Социальные сети" value={user.socialNetwork} isLink />
                )}
                {user.bio && (
                  <div className="pt-3 border-t">
                    <Label className="text-muted-foreground">Биография</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {/* Блок «Верификация / Договор» */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
        <div className={`relative overflow-hidden rounded-2xl border-2 p-6 ${
          user.contractSigned
            ? "border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
            : verificationStatus === "submitted"
              ? "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5"
              : "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/5"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              user.contractSigned
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : verificationStatus === "submitted"
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
            }`}>
              {user.contractSigned ? <FileCheck2 className="w-7 h-7" /> : verificationStatus === "submitted" ? <Loader2 className="w-7 h-7" /> : <FileX2 className="w-7 h-7" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">Верификация</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                  user.contractSigned
                    ? "bg-green-500/15 text-green-600 dark:text-green-400"
                    : verificationStatus === "submitted"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                }`}>
                  {user.contractSigned
                    ? "Верификация пройдена"
                    : verificationStatus === "submitted"
                      ? "На проверке"
                      : "Не пройдена"}
                </span>
              </div>
              {user.contractSigned ? (
                <p className="text-sm text-muted-foreground mt-1.5">
                  ✅ Договор подписан. У вас есть полный доступ к созданию и загрузке релизов
                </p>
              ) : verificationStatus === "submitted" ? (
                <p className="text-sm text-muted-foreground mt-1.5">
                  🔄 Данные отправлены на проверку. После одобрения договор будет активирован
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1.5">
                  ⚠️ Пройдите верификацию для создания релизов. После проверки договор будет отправлен на вашу почту
                </p>
              )}
              {!user.contractSigned && verificationStatus !== "submitted" && (
                <Button
                  onClick={() => router.push("/artist/verification")}
                  className="mt-3 gap-2"
                  size="sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Пройти верификацию
                </Button>
              )}
            </div>
            <FileSignature className="w-8 h-8 text-muted-foreground/20 hidden sm:block shrink-0" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isLink }: { icon: any; label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {isLink && value.startsWith("http") ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-fuchsia-400 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="font-medium break-words">{value}</p>
        )}
      </div>
    </div>
  );
}
