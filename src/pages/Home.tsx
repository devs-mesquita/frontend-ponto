import { useAuthUser } from "react-auth-kit";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { /* addDays, */ format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  document.title = "Ponto Eletrônico";
  const auth = useAuthUser();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined, //new Date(),
    to: undefined, //addDays(new Date(), 30),
  });
  return (
    <div className="my-4 flex flex-1 flex-col p-4 font-mono ">
      <h1 className="pb-4 text-center tracking-widest text-slate-100/80">
        Olá, {auth()?.user.name.split(" ")[0]}.
      </h1>
      <div className={cn("dark grid gap-2")}>
        <Popover>
          <PopoverTrigger asChild className="dark">
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "dark w-[300px] justify-start text-left font-normal text-slate-100",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yy", { locale: ptBR })} ~{" "}
                    {format(date.to, "dd/MM/yy", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yy", { locale: ptBR })
                )
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="dark w-auto p-0" align="start">
            <Calendar
              className="dark"
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
