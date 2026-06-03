import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = {
  selected?: Date | null
  onSelect?: (date: Date | null) => void
  className?: string
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => selected || new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleSelectDate = (day: number) => {
    if (onSelect) {
      onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0))
    }
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long' })
  const year = currentMonth.getFullYear()

  return (
    <div className={cn("p-3 w-[280px]", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {monthName} {year}
        </div>
        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-muted-foreground text-[0.8rem] font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {previousMonthDays.map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8" />
        ))}
        {days.map((day) => (
          <Button
            key={day}
            variant={isSelected(day) ? "default" : "ghost"}
            className={cn(
              "h-8 w-8 p-0 font-normal",
              isSelected(day) ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "hover:bg-muted hover:text-foreground",
              !isSelected(day) && isToday(day) && "bg-accent text-accent-foreground font-bold"
            )}
            onClick={() => handleSelectDate(day)}
          >
            {day}
          </Button>
        ))}
      </div>
      <div className="mt-4 pt-2 border-t border-border text-center">
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => onSelect?.(null)}>
          Clear Date
        </Button>
      </div>
    </div>
  )
}
