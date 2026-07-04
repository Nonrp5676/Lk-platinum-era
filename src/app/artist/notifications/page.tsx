"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Уведомления</h1>
      </div>

      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Нет новых уведомлений</h3>
          <p className="text-muted-foreground text-sm">Здесь будут появляться лайки, новые подписчики и комментарии к вашим постам и историям.</p>
        </CardContent>
      </Card>
    </div>
  );
}
