import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  api = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getBlockdates() {
    return this.http.get<any>(this.api + '/getBlockDate');
  }
  getBookingData() {
    return this.http.get<any>(this.api + '/getBookingData');
  }
  getWorkingHours() {
    return this.http.get<any>(this.api + '/getWorkingHours');
  }
}
