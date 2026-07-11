"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowLeft, Shield, FileText, Check, Loader2, X, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

// Simple signature pad
const SignaturePad = ({ onSign, onClearTrigger }: { onSign: (data: string) => void, onClearTrigger: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      const context = canvas.getContext("2d");
      if (context) {
        context.scale(2, 2);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "white";
        context.lineWidth = 3;
        setCtx(context);
      }
    }
  }, []);

  useEffect(() => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onSign("");
    }
  }, [onClearTrigger]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      ctx?.closePath();
      setIsDrawing(false);
      onSign(canvasRef.current?.toDataURL() || "");
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="w-full h-[200px] border border-white/10 rounded-2xl bg-white/5 cursor-crosshair touch-none"
    />
  );
};

export default function ContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("draft");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    lastName: "", firstName: "", middleName: "",
    dob: "", birthPlace: "", phone: "",
    passportSeries: "", passportNumber: "", passportDate: "",
    passportIssuedBy: "", passportCode: "", address: "",
    bankAccount: "", bankName: ""
  });

  const [showSignModal, setShowSignModal] = useState(false);
  const [signature, setSignature] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch("/api/user/verification")
      .then(r => r.json())
      .then(d => {
        if (d.verification) {
          setStatus(d.verification.status);
          if (d.verification.passportData) {
            setForm(prev => ({ ...prev, ...d.verification.passportData }));
          }
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleOpenSign = () => {
    const required = Object.values(form);
    if (required.some(v => !v.trim())) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }
    setShowSignModal(true);
  };

  const handleSubmit = async () => {
    if (!signature) {
      toast.error("Поставьте подпись");
      return;
    }
    if (!agreed) {
      toast.error("Примите условия политики конфиденциальности");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "artist",
          contractType: "individual",
          country: "RU",
          passportData: { ...form, signatureBase64: signature },
          addressData: {},
          bankData: {},
          signatureBase64: signature,
          finalConfirmed: true
        })
      });
      if (res.ok) {
        setStatus("submitted");
        setShowSignModal(false);
        toast.success("Договор успешно отправлен");
      } else {
        toast.error("Ошибка при отправке");
      }
    } catch(e) {
      toast.error("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-white/50" /></div>;
  }

  if (status === "submitted" || status === "approved") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-12">
          <Button variant="ghost" size="icon" onClick={() => router.push("/artist/profile")} className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Лицензионный договор</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Договор подписан</h2>
          <p className="text-muted-foreground text-center max-w-sm mb-12 leading-relaxed">
            Вы успешно заполнили необходимую информацию и отправили договор. Теперь вы можете полноценно загружать новый материал!
          </p>
          
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 font-bold shadow-lg shadow-green-500/20" onClick={() => router.push("/artist/upload")}>
            <span className="text-xl mr-2">🎉</span> Договор успешно подписан
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/artist/profile")} className="text-white hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Лицензионный договор</h1>
        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-xs">OL</div>
      </div>

      <div className="bg-white/5 rounded-[2rem] p-6 md:p-10 border border-white/5 backdrop-blur-xl mb-8">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
          <Globe className="w-12 h-12 text-black" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">Почему нам нужны<br/>паспортные данные?</h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
          <p>Сбор паспортных данных для заключения лицензионного договора.</p>
          <p>Оператор собирает и обрабатывает паспортные данные Пользователя (ФИО, серию и номер паспорта, дату выдачи, наименование органа, выдавшего паспорт, код подразделения, адрес регистрации) исключительно для целей заключения и исполнения договора оказания услуг.</p>
          <p>Правовым основанием обработки является пункт 5 части 1 статьи 6 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных». Согласие Пользователя на обработку данных в указанных целях не требуется.</p>
          <p>Предоставляя паспортные данные при заключении договора, Пользователь подтверждает, что:</p>
          <ul className="list-none space-y-1">
            <li>– данные принадлежат лично ему и являются достоверными;</li>
            <li>– он ознакомлен с настоящей Политикой и условиями обработки персональных данных;</li>
            <li>– он понимает цели сбора и обработки его паспортных данных.</li>
          </ul>
          <p>Паспортные данные хранятся в течение срока действия договора и в течение срока исковой давности после его прекращения (3 года), после чего подлежат уничтожению.</p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
            <Shield className="w-6 h-6 text-white shrink-0" />
            <div>
              <p className="font-bold text-sm">Защищено</p>
              <p className="text-xs text-muted-foreground mt-0.5">Полученные данные надежно защищены и зашифрованы.</p>
            </div>
          </div>
          
        </div>
      </div>

      <div className="space-y-8 mb-48">
        {/* Basic Info */}
        <section>
          <h2 className="text-2xl font-bold mb-1">Основная информация</h2>
          <p className="text-sm text-muted-foreground mb-6">Основные данные для создания драфта договора</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputBlock label="Фамилия" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Иванов" />
            <InputBlock label="Имя" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Иван" />
            <InputBlock label="Отчество" name="middleName" value={form.middleName} onChange={handleChange} placeholder="Иванович" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <InputBlock label="Дата рождения" name="dob" value={form.dob} onChange={handleChange} placeholder="ДД.ММ.ГГГГ" />
            <InputBlock label="Место рождения" name="birthPlace" value={form.birthPlace} onChange={handleChange} placeholder="г. Москва" />
            <InputBlock label="Номер телефона" name="phone" value={form.phone} onChange={handleChange} placeholder="+7XXXXXXXXXX" />
          </div>
        </section>

        {/* Identity Info */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Идентификационные данные</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Паспортные данные гарантируют оригинальность материала и отсутствие нарушений со стороны артиста, а также гарантируют выплату средств и исполнение условий с нашей стороны.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputBlock label="Серия паспорта" name="passportSeries" value={form.passportSeries} onChange={handleChange} placeholder="4 цифры" />
            <InputBlock label="Номер паспорта" name="passportNumber" value={form.passportNumber} onChange={handleChange} placeholder="6 цифр" />
            <InputBlock label="Дата получения" name="passportDate" value={form.passportDate} onChange={handleChange} placeholder="ДД.ММ.ГГГГ" className="col-span-2 md:col-span-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <InputBlock label="Кем выдан" name="passportIssuedBy" value={form.passportIssuedBy} onChange={handleChange} placeholder="Отделом МВД..." />
            <InputBlock label="Код подразделения" name="passportCode" value={form.passportCode} onChange={handleChange} placeholder="XXXXXX" />
            <InputBlock label="Адрес регистрации" name="address" value={form.address} onChange={handleChange} placeholder="г. Москва..." />
          </div>
        </section>

        {/* Bank Info */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Банковские реквизиты</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Банковские данные требуются для выплаты средств, в случае, если автор не может самостоятельно предоставить актуальные реквизиты
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputBlock label="Номер счета" name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="20 цифр" />
            <InputBlock label="Наименование банка" name="bankName" value={form.bankName} onChange={handleChange} placeholder="АО ТИНЬКОФФ БАНК" />
          </div>
        </section>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-[70px] md:bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/10 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl h-14 font-bold text-base shadow-xl shadow-indigo-500/20" onClick={handleOpenSign}>
            Подписать договор
          </Button>
          <p className="text-[10px] text-muted-foreground w-full leading-tight hidden md:block">
            Нажимая кнопку «Подписать договор», я соглашаюсь с обработкой персональных данных согласно политике конфиденциальности.
          </p>
        </div>
      </div>

      {/* Signature Modal */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="max-w-md bg-[#161616] border-white/10 text-white p-6 rounded-[2rem]">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-xl font-bold">Подпись договора</DialogTitle>
            <DialogClose className="text-white/50 hover:text-white"><X className="w-5 h-5"/></DialogClose>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Ознакомьтесь с примером договора и поставьте подпись</p>

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <div>
                <p className="text-sm font-semibold">Licensee_Agreement.pdf</p>
                <p className="text-xs text-muted-foreground">81.3KB</p>
              </div>
            </div>
            <a href="/Licensee_Agreement_example.pdf" target="_blank" download className="text-white/50 hover:text-white">
              <Download className="w-5 h-5" />
            </a>
          </div>

          <div className="mb-4">
            <SignaturePad onSign={setSignature} onClearTrigger={clearTrigger} />
          </div>

          <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12 mb-6" onClick={() => setClearTrigger(c => c + 1)}>
            <X className="w-4 h-4 mr-2" /> Очистить подпись
          </Button>

          <label className="flex items-start gap-3 cursor-pointer mb-6 group">
            <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${agreed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
              {agreed && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span className="text-sm text-muted-foreground leading-snug">Я принимаю условия политики конфиденциальности</span>
          </label>

          <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl h-14 font-bold text-base shadow-xl shadow-indigo-500/20" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Подписать договор <Check className="w-5 h-5 ml-2" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InputBlock({ label, name, value, onChange, placeholder, className = "" }: any) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-white/80 pl-1">{label}</label>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-14 rounded-[1.25rem] bg-white/5 border border-white/5 text-base px-4 focus-visible:ring-1 focus-visible:ring-indigo-500 text-white placeholder:text-muted-foreground"
      />
    </div>
  );
}
