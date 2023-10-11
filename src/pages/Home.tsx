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

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (date?.from && date.to && auth()?.user.cpf) {
      console.log("Sent !");
      console.log(date, auth()?.user.cpf);
    }
  };

  return (
    <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
      <h1 className="text-center text-slate-200/90">Consultar Pontos</h1>
      <form
        className="flex items-center justify-center gap-4"
        onSubmit={handleSubmit}
      >
        <div className={cn("dark grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild className="dark">
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "dark w-[280px] justify-start text-left font-normal text-slate-100",
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
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="dark w-auto bg-slate-800 bg-gradient-to-br from-indigo-700/30 to-rose-500/30 p-0 shadow shadow-black/30"
              align="start"
            >
              <Calendar
                className="dark"
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                max={31}
                locale={ptBR}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <button className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white">
          Enviar
        </button>
      </form>
    </div>
  );
}
