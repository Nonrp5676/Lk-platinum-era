"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2, Clock, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Для подтверждения email при логине
  const [needVerify, setNeedVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPending(false);

    const formData = new FormData(e.currentTarget);
    const login = formData.get("login") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: login, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "PENDING_APPROVAL") {
          setPending(true);
        } else if (data.error === "EMAIL_NOT_VERIFIED") {
          setVerifyEmail(login.toLowerCase());
          try {
            await fetch("/api/auth/resend-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: login.toLowerCase() }),
            });
          } catch {}
          setNeedVerify(true);
          setResendCooldown(60);
        } else if (data.error === "TECHNICAL_BREAK") {
          setError("🔧 Технический перерыв. " + (data.reason || "Сайт временно недоступен."));
        } else {
          setError(data.error || "Ошибка авторизации");
        }
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("bearer_token", data.token);
      }

      if (data.user.isAdmin) {
        router.push("/admin/dashboard");
      } else if (data.user.isManager) {
        router.push("/manager/artists");
      } else {
        router.push("/artist/dashboard");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
      setIsLoading(false);
    }
  };

  const header = (
    <header className="w-full border-b border-[#e6e9ee] bg-white flex-shrink-0">
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4">
        <img
          src="/logo.svg"
          alt="NIGHTVOLT Logo"
          className="w-14 h-14 object-contain"
        />
        <div className="leading-tight">
          <div className="text-2xl font-bold text-gray-900">NIGHTVOLT</div>
          <div className="text-sm text-gray-500">Label/Distributor</div>
        </div>
      </div>
    </header>
  );

  if (needVerify) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#f7f9fb] text-gray-900 overflow-hidden">
        <header className="w-full border-b border-[#e6e9ee] bg-white flex-shrink-0">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4">
            <img
              src="/logo.svg"
              alt="NIGHTVOLT Logo"
              className="w-14 h-14 object-contain"
            />
            <div className="leading-tight">
              <div className="text-2xl font-bold text-gray-900">NIGHTVOLT</div>
              <div className="text-sm text-gray-500">Label/Distributor</div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10">
              <div className="w-16 h-16 bg-[#cd792f]/10 text-[#cd792f] rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">Подтвердите почту</h1>
              <p className="text-gray-500 text-sm text-center mb-8">
                Мы отправили код на<br />
                <span className="font-semibold text-gray-900">{verifyEmail}</span>
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  setError("");
                  try {
                    const res = await fetch("/api/auth/verify-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Неверный код");
                    setNeedVerify(false);
                    setError("");
                    // Авто-вход после подтверждения
                    router.push("/");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Ошибка");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <Input
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="h-[48px] text-center text-2xl tracking-[0.5em] font-bold border-[#cfd6e0] focus-visible:ring-2 focus-visible:ring-[#cd792f] focus-visible:border-[#cd792f]"
                  autoFocus
                />
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                <Button type="submit" className="w-full h-[48px] bg-[#cd792f] hover:bg-[#b8661f] text-white text-base font-medium rounded-lg transition-colors" disabled={isLoading || verifyCode.length !== 6}>
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Проверка...</> : "Подтвердить"}
                </Button>
              </form>
              <div className="text-center mt-6">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-400">Отправить код повторно через {resendCooldown} сек</p>
                ) : (
                  <button
                    onClick={async () => {
                      setResendCooldown(60);
                      await fetch("/api/auth/resend-code", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: verifyEmail }),
                      });
                    }}
                    className="text-sm text-[#cd792f] font-medium hover:underline"
                  >
                    Отправить код повторно
                  </button>
                )}
              </div>
              <button onClick={() => { setNeedVerify(false); setError(""); }} className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-900">
                ← Назад к входу
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#f7f9fb] text-gray-900 overflow-hidden">
        {header}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-9 h-9" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Заявка на рассмотрении
              </h1>
              <p className="text-gray-600 mb-8">
                Ваша заявка ещё не была одобрена администратором. Войти в
                систему можно только после активации аккаунта. С вами свяжется
                менеджер в указанной при регистрации социальной сети.
              </p>
              <Button
                onClick={() => setPending(false)}
                className="w-full h-[48px] bg-[#cd792f] hover:bg-[#b8661f] text-white text-base font-medium rounded-lg transition-colors"
              >
                Вернуться к форме входа
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f7f9fb] text-gray-900 overflow-hidden">
      {header}

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e5eb] p-8 sm:p-10">
            <h1 className="text-[28px] font-semibold text-gray-900 mb-6">Вход</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="login"
                  type="text"
                  placeholder="Введите логин"
                  required
                  disabled={isLoading}
                  className="h-[48px] text-base placeholder:text-gray-400 border-[#cfd6e0] focus-visible:ring-2 focus-visible:ring-[#cd792f] focus-visible:border-[#cd792f]"
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  required
                  disabled={isLoading}
                  className="h-[48px] text-base placeholder:text-gray-400 border-[#cfd6e0] focus-visible:ring-2 focus-visible:ring-[#cd792f] focus-visible:border-[#cd792f]"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-[48px] bg-[#cd792f] hover:bg-[#b8661f] text-white text-base font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm mt-4">
                <a href="https://pyrus.com/form/2381667" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">
                  Пользовательское соглашение
                </a>
                <a href="#" className="text-gray-500 hover:underline">
                  Политика конфиденциальности
                </a>
              </div>
            </form>
          </div>
          <div className="mt-6 text-center">
            <span className="text-gray-600">Нет аккаунта? </span>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-[#cd792f] font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
