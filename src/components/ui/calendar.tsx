import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-white',
        caption_dropdowns: 'flex items-center gap-2',
        dropdown: 'bg-white/20 text-white border-white/30 rounded px-3 py-2 text-sm font-medium min-w-[80px] cursor-pointer hover:bg-white/30 focus:bg-white/30',
        dropdown_year: 'bg-white/20 text-white border-white/30 rounded px-3 py-2 text-sm font-medium min-w-[80px] cursor-pointer hover:bg-white/30 focus:bg-white/30',
        dropdown_month: 'bg-white/20 text-white border-white/30 rounded px-3 py-2 text-sm font-medium min-w-[100px] cursor-pointer hover:bg-white/30 focus:bg-white/30',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-white/10 border-white/20 text-white p-0 opacity-70 hover:opacity-100 hover:bg-white/20'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-white/80 rounded-md w-9 font-semibold text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal text-white hover:bg-white/20 hover:text-white aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black focus:bg-yellow-400 focus:text-black font-semibold',
        day_today: 'bg-white/20 text-white font-semibold border border-yellow-400',
        day_outside:
          'day-outside text-white/40 opacity-50 hover:text-white/60 aria-selected:bg-yellow-400/50 aria-selected:text-black aria-selected:opacity-30',
        day_disabled: 'text-white/30 opacity-50 cursor-not-allowed',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        ...(components || {}),
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
