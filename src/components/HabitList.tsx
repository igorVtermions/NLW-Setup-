import { Check } from "phosphor-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import dayjs from "dayjs";

interface HabitsListProps {
  date: Date;
  onCompletedChanged: (completed: number) => void
}

interface HabitsInfo {
  possibleHabits: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  completedHabits: string[];
}

export function HabitList({ date , onCompletedChanged}: HabitsListProps) {
  const [habitInfo, setHabitInfo] = useState<HabitsInfo>();

  useEffect(() => {
    api
      .get("day", {
        params: {
          date: date.toISOString(),
        },
      })
      .then((response) => {
        setHabitInfo(response.data);
      });
  }, []);

  async function handleToggleHabit(habitId: string){
    const isHabitAlreadyCompleted = habitInfo!.completedHabits.includes(habitId)

    await api.patch(`/habits/${habitId}/toggle`)

    let completedHabits: string[] = []

    if(isHabitAlreadyCompleted){
      completedHabits = habitInfo!.completedHabits.filter(id => id !== habitId)

    }else{
          completedHabits = [...habitInfo!.completedHabits, habitId]
    }
    setHabitInfo({
      possibleHabits: habitInfo!.possibleHabits,
      completedHabits,
    })

    onCompletedChanged(completedHabits.length)
  }

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date())

  return (
    <div className="mt-6 flex flex-col gap-3">
      {habitInfo?.possibleHabits.map((habit) => {
        return (
          <Checkbox.Root 
          key={habit.id}
          onCheckedChange={() => handleToggleHabit(habit.id)}
          checked= {habitInfo.completedHabits.includes(habit.id)}
          disabled={isDateInPast}
          className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800  group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors ">
              <Checkbox.Indicator>
                <Check size={20} className="text-white" />
              </Checkbox.Indicator>
            </div>

            <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
              {habit.title}
            </span>
          </Checkbox.Root>
        );
      })}
    </div>
  );
}
