import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const { transactions } = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const locale = i18n.language === "pt" ? ptBR : enUS;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    return eachDayOfInterval({ start, end }).map((day) =>
      format(day, "EEE", { locale })
    );
  }, [locale]);

  const getDayTransactions = (date) => {
    return transactions.filter((t) => isSameDay(new Date(t.date), date));
  };

  const getDayStats = (dayTransactions) => {
    const income = dayTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const expense = dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    return { income, expense };
  };

  const handleDayClick = (date, dayTransactions) => {
    if (dayTransactions.length > 0) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("calendar.title")}
          </h2>
          <p className="text-muted-foreground">{t("calendar.subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[150px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-muted-foreground capitalize"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayTransactions = getDayTransactions(day);
              const { income, expense } = getDayStats(dayTransactions);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 border-b border-r relative transition-colors hover:bg-muted/50 cursor-pointer ${
                    !isCurrentMonth ? "bg-muted/20 text-muted-foreground" : ""
                  } ${isTodayDate ? "bg-primary/5" : ""}`}
                  onClick={() => handleDayClick(day, dayTransactions)}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                        isTodayDate
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {(income > 0 || expense > 0) && (
                      <div className="flex flex-col gap-1 items-end">
                        {income > 0 && (
                          <div className="flex items-center text-[10px] text-green-600 font-medium bg-green-100 px-1.5 py-0.5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1" />
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              notation: "compact",
                            }).format(income)}
                          </div>
                        )}
                        {expense > 0 && (
                          <div className="flex items-center text-[10px] text-red-600 font-medium bg-red-100 px-1.5 py-0.5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1" />
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              notation: "compact",
                            }).format(expense)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "PPP", { locale })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {selectedDate &&
              getDayTransactions(selectedDate).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        t.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(t.amount)}
                  </span>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
