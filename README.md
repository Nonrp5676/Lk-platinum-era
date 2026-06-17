# NIGHTVOLT — Artist Portal

Музыкальная платформа для лейблов и дистрибьюторов. Личный кабинет артиста с загрузкой релизов, модерацией, финансами, верификацией и Telegram-ботом.

## 🎵 Возможности

- **Личный кабинет артиста** — релизы, черновики, модерация, аналитика
- **Загрузка релизов** — Single / EP / Album / Single Maxi / Mixtape с полной формой метаданных
- **Система верификации** — пошаговая форма (паспорт, адрес, банк) с поддержкой РФ / КЗ / РБ
- **Договоры** — блокировка релизов до подписания договора
- **Email-верификация** — регистрация с кодом подтверждения через SMTP
- **Telegram-бот** — уведомления о статусах релизов
- **Финансы** — кошельки, отчёты, транзакции
- **Поддержка** — тикеты, чат, FAQ
- **Тёмная/светлая тема** + анимации (снежинки, гирлянда)
- **Админ-панель** — управление артистами, релизами, верификациями, новостями

## 🛠 Технологии

- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS 4**
- **Drizzle ORM** + **Turso** (libSQL)
- **Supabase** (Storage)
- **Nodemailer** (SMTP)
- **Framer Motion**
- **shadcn/ui** + **Radix UI**

## 🚀 Установка

### 1. Клонирование

```bash
git clone https://github.com/your-username/nightvolt-portal.git
cd nightvolt-portal
npm install --legacy-peer-deps
```

### 2. Настройка `.env`

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

Понадобятся:
- **Turso** — база данных (бесплатно на [turso.tech](https://turso.tech))
- **Supabase** — хранилище файлов (бесплатно на [supabase.com](https://supabase.com))
- **SMTP** — почтовый сервер для кодов подтверждения

### 3. Создание базы данных

После создания Turso БД, примените схему:

```bash
npx drizzle-kit push
```

Затем создайте администратора:

```sql
INSERT INTO artists (uid, email, password, name, plan, is_admin, is_approved, email_verified, contract_signed, label, created_at)
VALUES ('admin-001', 'admin@yoursite.com', '$2b$10$...bcrypt-hash...', 'Admin', 'advanced', 1, 1, 1, 1, 'YOUR LABEL', datetime('now'));
```

### 4. Создание buckets в Supabase

Создайте 3 публичных bucket:
- `release-covers` — обложки релизов
- `release-tracks` — аудио файлы
- `avatars` — аватарки артистов

### 5. Запуск

```bash
npm run dev
```

Откройте `http://localhost:3000`

## 📁 Структура

```
src/
├── app/
│   ├── artist/          # Личный кабинет артиста
│   ├── admin/           # Админ-панель
│   ├── manager/         # Кабинет менеджера
│   ├── api/             # API routes (74+ endpoints)
│   └── register/        # Регистрация
├── components/          # React компоненты + UI (shadcn)
├── db/                  # Drizzle schema + seeds
├── lib/                 # Auth, email, telegram, utils
├── hooks/               # useUser, useMaintenance, useHeartbeat
└── middleware.ts        # Защита маршрутов
```

## 📝 Лицензия

MIT — используйте свободно для своих проектов.

## 🔐 Безопасность

- `.env` **никогда** не коммитьте (уже в `.gitignore`)
- JWT-сессии через httpOnly cookies
- bcrypt для хеширования паролей
- Проверка прав на каждом API endpoint
