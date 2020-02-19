import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  // you can override any of the methods defined in the parent class

  monthTooltip(event: CalendarEvent): string {
    return 'a';
  }

  weekTooltip(event: CalendarEvent): string {
    return 'b';
  }

  dayTooltip(event: CalendarEvent): string {
    return 'c';
  }
}
