import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {
  CalendarEvent, CalendarView, CalendarEventTimesChangedEvent, CalendarMonthViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent, CalendarDateFormatter,
  CalendarDayViewBeforeRenderEvent, CalendarEventTitleFormatter,
} from 'angular-calendar';
import {Subject} from 'rxjs';
import {CustomDateFormatter} from '../lib/custom-date-formatter.provider';
import {CustomEventTitleFormatter} from '../lib/tooltip';
import {CalendarService} from '../service/calendar.service';

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
  viewDate: Date = new Date(2020, 0, 31);
  selectedEvent: any = [];
  selectedEvent2: any = [];
  events = [];
  externalEvents: CalendarEvent[] = [];
  clickedDate: Date;
  clickedColumn: number;
  refresh: Subject<any> = new Subject();
  activeDayIsOpen = false;
  weekBlockDates = [];
  display = 'none';
  startValue: Date = new Date(2020, 0, 31);
  eventData: any = {};
  userData: any = {};
  dayStartHour: any = 0;
  weekStartHour: any = 9;
  dayBlockTime: any = [];
  searchData: any = {};
  classApply = false;
  inEdit = false;


  constructor(private calendarService: CalendarService) {
    this.eventData.allDay = false;
    this.eventData.start = new Date();
    this.eventData.end = new Date();
  }

  ngOnInit() {
    console.log('hit oninit', this.clickedDate);


    this.getWorkingHours();
    this.getBlockDateForWeek();
    this.getEventData();
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

  getEventData() {
    this.calendarService.getBookingData()
      .subscribe((res) => {
        console.log('getBookingData res', res);
        this.events = [];
        (res.applicantdata).forEach((x) => {
          const date = new Date(x.date_selected);
          const str = (x.time_slots).split(':');
          date.setHours(str[0], str[1], str[2]);
          const json = {
            title: x.firstname + ' ' + x.lastname,
            color: (x.product_type === 'first_timer') ? this.colors.yellow : this.colors.blue,
            start: date,
            product_type: x.product_type,
            product_name: x.product_name,
            firstname: x.firstname,
            lastname: x.lastname,
            phonenumber: x.phonenumber,
            unique_id: x.unique_id,
            order_id: x.order_id,
            email: x.email,
            totalTime: Number(x.product_duration),
            draggable: true,
            resizable: {
              beforeStart: true,
              afterEnd: true
            }
          };
          /*if (x.endTime)
            json['end'] = new Date(x.endTime);*/
          this.events.push(json);
        });
      }, (err) => {
        console.log('getBookingData err', err);
      });
  }

  getWorkingHours() {
    this.calendarService.getWorkingHours()
      .subscribe((res) => {
        console.log('getWorkingHours res', res);
        let index = (this.viewDate).getDay();
        if (index === 0) {
          index = 7;
        }
        const data = res.applicantdata.filter(x => x.unique_id === index)[0];
        this.dayStartHour = (data.opening_hour).split(':')[0];
        if (data.blocks_blocker) {
          this.dayBlockTime = JSON.parse(data.blocks_blocker);
        } else {
          this.dayBlockTime = [];
        }
      }, (err) => {
        console.log('getBookingData err', err);
      });
  }

  getBlockDateForWeek() {
    console.log('getBlockDateForWeek');
    this.calendarService.getBlockdates()
      .subscribe((res) => {
        console.log('getBlockdates res', res);
        this.weekBlockDates = res.applicantdata;
      }, (err) => {
        console.log('getBlockdates err', err);
      });
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
    console.log('beforeWeekViewRender');
    const that = this;
    this.calendarService.getBlockdates()
      .subscribe((res) => {
        console.log('getBlockdates res', res);
        this.weekBlockDates = res.applicantdata;

        renderEvent.hourColumns.forEach(hourColumn => {
          hourColumn.hours.forEach(hour => {
            hour.segments.forEach(segment => {
              that.checkBlockDate(segment.date, that.weekBlockDates, function (data) {
                if (data.length > 0) {
                  let str = '';
                  let hr = new Date(segment.date).getHours();
                  let min = new Date(segment.date).getMinutes();
                  if ((hr).toString().length === 1) {
                    str = '0' + hr.toString();
                  } else {
                    str = hr.toString();
                  }
                  if ((min).toString().length === 1) {
                    str += ':' + '0' + min.toString();
                  } else {
                    str += ':' + min.toString();
                  }

                  let checkAry = (data[1].blocks_json);
                  if (checkAry.includes(str)) {
                    segment.cssClass = 'bg-pink';
                  } else {

                  }
                } else {

                }
              });
            });
          });
        });

      }, (err) => {
        console.log('getBlockdates err', err);
      });

  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
    this.getWorkingHours();
    // this.getEventData();
    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {

          let str = '';
          const hr = new Date(segment.date).getHours();
          const min = new Date(segment.date).getMinutes();
          if ((hr).toString().length === 1) {
            str = '0' + hr.toString();
          } else {
            str = hr.toString();
          }
          if ((min).toString().length === 1) {
            str += ':' + '0' + min.toString();
          } else {
            str += ':' + min.toString();
          }

          if (this.dayBlockTime.includes(str)) {
            segment.cssClass = 'bg-pink';
          }
          if (this.dayBlockTime.length === 0) {
            segment.cssClass = 'bg-pink';
          }
        });
      });
    });
  }


  onSearchFilter() {
    this.calendarService.searchFilter(this.searchData.date, this.searchData.text)
      .subscribe((res) => {
        console.log('search Filterres', res);
        if (res.applicantdata) {
          this.classApply = true;
        }
      }, (err) => {
        console.log('searchFilter err', err);
      });
  }

  onSelectDate(date) {
    // this.clickedDate = new Date(2020, 03, 25);
  }

  checkBlockDate(date, ary, callback) {
    const d2 = new Date(date).getDate();
    const m2 = new Date(date).getMonth();
    const y2 = new Date(date).getFullYear();
    let flag = true;
    ary.forEach((x) => {
      const d1 = new Date(x.date_selected).getDate();
      const m1 = new Date(x.date_selected).getMonth();
      const y1 = new Date(x.date_selected).getFullYear();

      if (d1 === d2 && m1 === m2 && y1 === y2) {
        callback([date, x]);
        flag = false;
      }
    });
    if (flag) {
      callback([]);
    }

  }

  checkBlockTime(date, ary, callback) {
    let str = '';
    console.log('checkBlockTime');
    const hr = new Date(date).getHours();
    const min = new Date(date).getMinutes();
    if ((hr).toString().length === 1) {
      str = '0' + hr.toString();
    } else {
      str = hr.toString();
    }
    if ((min).toString().length === 1) {
      str += ':' + '0' + min.toString();
    } else {
      str += ':' + min.toString();
    }
    if (ary.includes(str)) {
      callback(true);
    } else {
      callback(false);
    }

  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log('handleEvent');
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
            if (x.title === y.title) {
              if (typeof allDay !== 'undefined') {
                y.allDay = allDay;
              }
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
               }: CalendarEventTimesChangedEvent, type): void {

    console.log('eventDropped');
    const that = this;
    if (type === 'week') {
      this.checkBlockDate(newStart, this.weekBlockDates, function (data) {
        if (data.length <= 0) {
          that.updateEvent(event, newStart, newEnd, allDay);
        } else {
          let str = '';
          let hr = new Date(newStart).getHours();
          let min = new Date(newStart).getMinutes();
          if ((hr).toString().length === 1) {
            str = '0' + hr.toString();
          } else {
            str = hr.toString();
          }
          if ((min).toString().length === 1) {
            str += ':' + '0' + min.toString();
          } else {
            str += ':' + min.toString();
          }

          let checkAry = (data[1].blocks_json);
          console.log('data', checkAry.length);
          if (checkAry.includes(str)) {
            alert('all Day Block');
          } else {
            that.updateEvent(event, newStart, newEnd, allDay);
          }
        }
      });
    } else {
      this.checkBlockTime(newStart, this.dayBlockTime, function (data) {
        if (data) {
          alert('Time Block');
        } else {
          that.updateEvent(event, newStart, newEnd, allDay);
        }
      });
    }
  }


  getTitle(event) {
    let str = event.title + '\n' + this.formatAMPM(event.start);
    if (event.end) {
      str += ' - ' + this.formatAMPM(event.end);
    }
    return str;
  }

  externalDrop(event: CalendarEvent) {
    alert('externalDrop' + event);
    let flag = false;
    (this.selectedEvent2).forEach((p) => {
      if (p.title === event.title) {
        flag = true;
      }
    });
    if (this.externalEvents.indexOf(event) === -1) {
      if (flag) {
        (this.selectedEvent2).forEach((x) => {
          const index2 = this.events.indexOf(x);
          this.events = this.events.filter(iEvent => iEvent !== x);
          this.externalEvents.push(x);
        });
      } else {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.externalEvents.push(event);
      }
    }
  }

  checkBoxCheck(selectedData) {
    console.log('checkBoxCheck');
    let flag = true;

    (this.selectedEvent).forEach((x, i) => {
      if (x.title === selectedData.title) {
        flag = false;
        this.removeByAttr(this.selectedEvent, 'title', selectedData.title);
      }
    });

    if (flag) {
      this.selectedEvent.push(selectedData);
    }

    this.selectedEvent2 = this.selectedEvent;
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
  };

  OnDayClickedEvent(date, event) {
    console.log('OnDayClickedEvent');
    if (!(event.sourceEvent.toElement.className).includes('bg-pink')) {
      this.eventData.time_slots = new Date(date).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
      this.display = 'block';
      this.inEdit = false;
    } else {
      alert('please select other day, this time is block');
    }
  }

  onCloseHandled() {
    this.display = 'none';
  }

  onSubmit(type) {
    this.eventData['booking_type'] = 'booking';
    this.eventData['product_duration'] = this.eventData.totalTime;
    if (type === 'Book') {
      const json = {};
      json['eventData'] = this.eventData;
      json['userData'] = this.userData;
      console.log('onSubmit', json);
      this.calendarService.createNewBooking(json)
        .subscribe((res) => {
        }, (err) => {

        });
    } else {
      const json = {};
      json['eventData'] = this.eventData;
      json['userData'] = this.userData;
      json['unique_id'] = this.eventData.unique_id;
      console.log('onSubmit', json);
      this.calendarService.updateBooking(json)
        .subscribe((res) => {
        }, (err) => {

        });
    }
    this.getEventData();
    this.display = 'none';
    this.eventData = {};
    this.userData = {};
    this.refresh.next();
  }

  formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  onEventEdit(weekEvent) {
    console.log('event', weekEvent);
    this.display = 'block';
    this.inEdit = true;
    this.eventData = weekEvent;
    this.userData = weekEvent;
    this.eventData.time_slots = new Date(weekEvent.start).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
    let year = new Date(weekEvent.start).getFullYear();
    let month = new Date(weekEvent.start).getMonth();
    let date = new Date(weekEvent.start).getDate();
    this.eventData.date_selected = new Date(year, month, date);
  }

  onDateChange(e) {
    console.log('eeeeeeeeeeee', e.target.value);
    let year = new Date(e.target.value).getFullYear();
    let month = new Date(e.target.value).getMonth();
    let date = new Date(e.target.value).getDate();
    this.viewDate = new Date(year, month, date);
  }
}
