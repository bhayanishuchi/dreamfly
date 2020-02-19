import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {
  CalendarEvent, CalendarView, CalendarEventTimesChangedEvent, CalendarMonthViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent, CalendarDateFormatter,
  CalendarDayViewBeforeRenderEvent, CalendarEventTitleFormatter,
} from "angular-calendar";
import {Subject} from 'rxjs';
import {addDays} from 'date-fns';
import {CustomDateFormatter} from '../lib/custom-date-formatter.provider';
import {CustomEventTitleFormatter} from '../lib/tooltip';
import update from "@angular/cli/commands/update";

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class MasterComponent implements OnInit {

  view: CalendarView = CalendarView.Day;

  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };

  viewDate: Date = new Date(2020, 1, 19);

  selectedEvent: any = [];
  selectedEvent2: any = [];

  events = [];
  externalEvents: CalendarEvent[] = [];

  clickedDate: Date;

  clickedColumn: number;

  refresh: Subject<any> = new Subject();

  activeDayIsOpen = false;
  blockDates = [];
  display = 'none';
  startValue: Date = new Date();
  eventData: any = {};


  constructor() {
    this.eventData.allDay = false;
    this.eventData.start = new Date();
    this.eventData.end = new Date();
  }

  ngOnInit() {
    console.log('hit oninit');
    let data = [
      {
        "text": "event 1",
        "playerType": "newbie",
        "startTime": "2020-2-19 10:00",
        "totalTime": "2",
        "allDay": true
      },
      {
        "text": "event 2",
        "playerType": "newbie",
        "startTime": "2020-2-19 10:00",
        "totalTime": "2",
        "allDay": true
      },
      {
        "text": "event 4",
        "playerType": "newbie",
        "startTime": "2020-2-19 11:00",
        "totalTime": "4",
        "allDay": true
      },
      {
        "text": "event 3",
        "playerType": "newbie",
        "startTime": "2020-2-19 10:00",
        "totalTime": "4",
        "allDay": true
      },
      {
        "text": "event 5",
        "playerType": "newbie",
        "startTime": "2020-2-19 12:00",
        "totalTime": "4",
        "allDay": true
      },
      {
        "text": "event 6",
        "playerType": "newbie",
        "startTime": "2020-2-19 11:00",
        "totalTime": "2",
        "allDay": true
      }
    ];
    this.blockDates = [{
      "date": "2020-2-20",
      "allDay": true
    },
      {
        "date": "2020-2-21 12:00",
        "endDate": "2020-2-21 15:00",
        "allDay": false
      },
      {
        "date": "2020-2-23",
        "allDay": true
      },
      {
        "date": "2020-2-25 12:00",
        "endDate": "2020-2-25 15:00",
        "allDay": false
      }];
    (data).forEach((x) => {
      let json = {
        title: x.text,
        color: (x.playerType === 'newbie') ? this.colors.yellow : this.colors.blue,
        start: new Date(x.startTime),
        totalTime: Number(x.totalTime),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      };
      /*if (x.endTime)
        json['end'] = new Date(x.endTime);*/
      this.events.push(json);
    });

    /*this.events = [
      {
        title: 'Event 1',
        color: this.colors.yellow,
        myDate: new Date(2020, 1, 19, 10, 0),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 10),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 2',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 10),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 20),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 5',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 20),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 30),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 6',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 30),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 40),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 7',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 40),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 50),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 8',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 50),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 52),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 9',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 52),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 54),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
      {
        title: 'Event 10',
        color: this.colors.blue,
        myDate: new Date(2020, 1, 19, 10, 54),
        start: new Date(2020, 1, 19, 10, 0),
        end: new Date(2020, 1, 19, 10, 56),
        draggable: true,
        resizable: {
          beforeStart: true, // this allows you to configure the sides the event is resizable from
          afterEnd: true
        }
      },
    ];*/

    this.externalEvents = [{
      title: 'External Event 1',
      color: this.colors.yellow,
      start: new Date(),
      draggable: true
    },
      {
        title: 'External Event 2',
        color: this.colors.blue,
        start: new Date(),
        draggable: true
      }];
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      const dayOfMonth = day.date.getDate();
      if (dayOfMonth > 5 && dayOfMonth < 10 && day.inMonth) {
        day.cssClass = 'bg-pink';
      }
    });
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    console.log('renderEvent', renderEvent);
    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {
          this.checkBlockDate(segment.date, this.blockDates, function (data) {
            if (data.length > 0) {
              if (data[1]) {
                segment.cssClass = 'bg-pink';
              } else {
                let n1 = new Date(data[2]).getHours();
                let n2 = new Date(data[3]).getHours();
                console.log('n1 n2', n1, n2);
                if (segment.date.getHours() >= n1 && segment.date.getHours() <= n2) {
                  segment.cssClass = 'bg-pink';
                }
              }
            } else {
              if (
                segment.date.getHours() >= 2 &&
                segment.date.getHours() <= 5 &&
                segment.date.getDay() === 2
              ) {
                segment.cssClass = 'bg-pink';
              }
            }
          });
        });
      });
    });
  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {
          if (segment.date.getHours() >= 2 && segment.date.getHours() <= 5) {
            segment.cssClass = 'bg-pink';
          }
        });
      });
    });
  }

  checkBlockDate(date, ary, callback) {
    // console.log('date', date);
    let d2 = new Date(date).getDate();
    let m2 = new Date(date).getMonth();
    let y2 = new Date(date).getFullYear();
    let flag = true;
    ary.forEach((x) => {
      let d1 = new Date(x.date).getDate();
      let m1 = new Date(x.date).getMonth();
      let y1 = new Date(x.date).getFullYear();

      if (d1 === d2 && m1 === m2 && y1 === y2) {
        // console.log('match', d1, d2, m1, m2, y1, y2);
        callback([date, x.allDay, x.date, x.endDate])
        flag = false;
      }
    });
    if (flag) {
      callback([])
    }

  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log('Event clicked', action);
    console.log('Event clicked', event);
  }

  dragEventChanged({
                     event,
                     newStart,
                     newEnd
                   }: CalendarEventTimesChangedEvent): void {
    alert('hit');
    event.start = newStart;
    event.end = newEnd;
    console.log('event', this.events);
    this.refresh.next();
  }

  updateEvent(event, newStart, newEnd, allDay) {
    const externalIndex = this.externalEvents.indexOf(event);
    if (typeof allDay !== 'undefined') {
      event.allDay = allDay;
    }
    if (externalIndex > -1) {
      this.externalEvents.splice(externalIndex, 1);
      this.events.push(event);
    }
    event.start = newStart;
    if (newEnd) {
      event.end = newEnd;
    }
    if (this.view === 'month') {
      this.viewDate = newStart;
      this.activeDayIsOpen = true;
    }
    this.events = [...this.events];


    let flag = false;
    (this.selectedEvent).forEach((p) => {
      if (p.title === event.title) {
        flag = true;
      }
    });
    if (flag) {
      if (this.selectedEvent.length > 0) {
        (this.selectedEvent).forEach((x) => {
          (this.events).forEach((y) => {
            if (x.text === y.title) {
              y.start = newStart;
              y.end = newEnd;
              // y.text = y.text;
            }
          });
        });
        this.selectedEvent = [];
      }
    }
  }

  eventDropped({
                 event,
                 newStart,
                 newEnd,
                 allDay
               }: CalendarEventTimesChangedEvent): void {

    console.log('eventDropped');
    this.checkBlockDate(newStart, this.blockDates, function (data) {
      if (data.length <= 0) {
        this.updateEvent(event, newStart, newEnd, allDay)
      } else {
        if(data[1]){
          alert('all Day Block');
        } else {

        }
        let n1 = new Date(data[2]).getHours();
        let n2 = new Date(data[3]).getHours();
      }
    });

  }


  externalDrop(event: CalendarEvent) {
    console.log('externalDrop', event);
    let flag = false;
    (this.selectedEvent2).forEach((p) => {
      if (p.title === event.title) {
        flag = true;
      }
    });

    console.log('flag', flag);
    if (this.externalEvents.indexOf(event) === -1) {
      if (flag) {
        console.log(flag);
        (this.selectedEvent2).forEach((x) => {
          console.log('x', x);
          const index2 = this.events.indexOf(x);
          console.log('index2', index2);
          this.events = this.events.filter(iEvent => iEvent !== x);
          this.externalEvents.push(x);
        })
      } else {
        console.log(flag);
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.externalEvents.push(event);
      }
    }
  }

  checkBoxCheck(selectedData) {
    console.log('checkBoxCheck', selectedData.title)
    let flag = true;

    (this.selectedEvent).forEach((x, i) => {
      if (x.title === selectedData.title) {
        flag = false;
        this.removeByAttr(this.selectedEvent, 'title', selectedData.title);
      }
    });

    console.log('flag', flag);
    if (flag)
      this.selectedEvent.push(selectedData);

    this.selectedEvent2 = this.selectedEvent;

    console.log('this.selectedEvent', this.selectedEvent);
    console.log('this.selectedEvent2', this.selectedEvent2);
  }

  removeByAttr = function (arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (arr[i]
        && arr[i].hasOwnProperty(attr)
        && (arguments.length > 2 && arr[i][attr] === value)) {

        arr.splice(i, 1);

      }
    }
    return arr;
  }

  OnDayClickedEvent(date) {
    console.log(date);
    this.display = 'block';
  }

  onCloseHandled() {
    this.display = 'none';
  }

  onSubmit() {
    console.log('this.eventData', this.eventData);
    this.display = 'none';
    let json = {
      title: this.eventData.title,
      color: this.colors[this.eventData.color],
      start: new Date(this.eventData.start),
      end: new Date(this.eventData.end),
      allDay: this.eventData.allDay,
      draggable: true,
      resizable: {
        beforeStart: true, // this allows you to configure the sides the event is resizable from
        afterEnd: true
      }
    };
    this.events.push(json);
    console.log('this.events', this.events);
    this.eventData = {};
    this.refresh.next();
  }

  onChange(data) {
    console.log('data', data);
    this.eventData.allDay = data;
  }
}
