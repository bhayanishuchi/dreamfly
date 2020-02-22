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

  searchFilter(date, name) {
    return this.http.get<any>(this.api + '/getBookingDetails?search_date=' + date + '&name=' + name);
  }

  createNewBooking(data) {
    return this.http.post<any>(this.api + '/createNewBooking', data);
  }
  updateBooking(data) {
    return this.http.post<any>(this.api + '/updateBooking', data);
  }

  subProductDetails(unique_id, order_id) {
    return this.http.get<any>(this.api + '/getSubProductDetails?unique_id=' + unique_id + '&order_id=' + order_id);
  }
  productList() {
    return this.http.get<any>(this.api + '/getlistofproduct');
  }
  addSubProduct(data) {
    return this.http.post<any>(this.api + '/addUserSubProduct', data);
  }
}
