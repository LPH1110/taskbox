import * as React from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = {
  selected?: Date | null
  onSelect?: (date: Date | null) => void
  className?: string
  showTimePicker?: boolean
}

export function Calendar({ selected, onSelect, className, showTimePicker = true }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => selected || new Date())
  
  const [hours, setHours] = React.useState(() => {
    if (!selected) return "12"
    let h = selected.getHours()
    if (h === 0) h = 12
    if (h > 12) h -= 12
    return h.toString().padStart(2, "0")
  })
  
  const [minutes, setMinutes] = React.useState(() => {
    if (!selected) return "00"
    return selected.getMinutes().toString().padStart(2, "0")
  })
  
  const [period, setPeriod] = React.useState<"AM" | "PM">(() => {
    if (!selected) return "PM"
    return selected.getHours() >= 12 ? "PM" : "AM"
  })

  React.useEffect(() => {
    if (selected) {
      setCurrentMonth(selected)
      let h = selected.getHours()
      setPeriod(h >= 12 ? "PM" : "AM")
      if (h === 0) h = 12
      if (h > 12) h -= 12
      setHours(h.toString().padStart(2, "0"))
      setMinutes(selected.getMinutes().toString().padStart(2, "0"))
    }
  }, [selected])

  const emitDateWithTime = (dateObj: Date, hStr: string, mStr: string, pStr: "AM"|"PM") => {
    if (!onSelect) return
    let h = parseInt(hStr, 10)
    if (isNaN(h)) h = 12
    const m = parseInt(mStr, 10) || 0
    
    if (pStr === "PM" && h !== 12) h += 12
    if (pStr === "AM" && h === 12) h = 0

    const newDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), h, m, 0)
    onSelect(newDate)
  }

  const handleTimeChange = (type: "h"|"m"|"p", value: string) => {
    let newH = hours
    let newM = minutes
    let newP = period

    if (type === "h") {
      newH = value
      setHours(value)
    } else if (type === "m") {
      newM = value
      setMinutes(value)
    } else if (type === "p") {
      newP = value as "AM"|"PM"
      setPeriod(newP)
    }

    if (selected) {
      emitDateWithTime(selected, newH, newM, newP)
    }
  }

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
      const dateToEmit = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      if (showTimePicker) {
        emitDateWithTime(dateToEmit, hours, minutes, period)
      } else {
        onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12, 0, 0))
      }
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

      {showTimePicker && (
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <Clock className="h-4 w-4" /> Time
          </div>
          <div className="flex items-center gap-1">
            <input 
              type="text" 
              maxLength={2} 
              className="w-8 h-7 text-center text-sm rounded bg-muted/50 border-0 focus:ring-1 focus:ring-primary outline-none" 
              value={hours}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '')
                handleTimeChange("h", val)
              }}
              onBlur={() => {
                let h = parseInt(hours) || 12
                if (h > 12) h = 12
                if (h < 1) h = 1
                const formatted = h.toString().padStart(2, "0")
                handleTimeChange("h", formatted)
              }}
            />
            <span className="text-muted-foreground font-medium">:</span>
            <input 
              type="text" 
              maxLength={2} 
              className="w-8 h-7 text-center text-sm rounded bg-muted/50 border-0 focus:ring-1 focus:ring-primary outline-none" 
              value={minutes}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '')
                handleTimeChange("m", val)
              }}
              onBlur={() => {
                let m = parseInt(minutes) || 0
                if (m > 59) m = 59
                const formatted = m.toString().padStart(2, "0")
                handleTimeChange("m", formatted)
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 ml-1 text-xs font-medium cursor-pointer"
              onClick={() => handleTimeChange("p", period === "AM" ? "PM" : "AM")}
            >
              {period}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-2 border-t border-border text-center flex flex-col gap-1">
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => onSelect?.(null)}>
          Clear Date
        </Button>
      </div>
    </div>
  )
}
