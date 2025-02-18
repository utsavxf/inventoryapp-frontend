import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { Device } from '../../../interface/device';

@Injectable({
  providedIn: 'root'
})



export class DeviceService {

  private apiUrl='http://localhost:8080/devices'; //base url for devices in our backend

  
  constructor(private http:HttpClient) { } //to send http request from our frontend to our backend 


  //We can say that observables handles streams of async data like API responses,user inputs and act like event emitters,pushing data to whoever subscribes to them

  /*deviceSubject holds all devices but device$ is just an observable that exposes the current value of deviceSubject
  devices$ is just like a read only stream of the data so that components/observers can subscribe to it where we need it*/
  
  private devicesSubject = new BehaviorSubject<Device[]>([]); // BehaviorSubject to hold devices
  devices$ = this.devicesSubject.asObservable(); // Observable to expose devices

  fetchDevices(){
    this.http.get<Device[]>(this.apiUrl+'/getAllDevices') //now this http request itself returns observable so deviceSubject here acts as consumer to subscribe to this observable and updates itself with data
    .subscribe((devices)=>{
      this.devicesSubject.next(devices); //this line serves 2 purpose :updating the deviceSubject with and notifying subscribers/other components ,so that all the components that subscribed to devices$ gets the updated list instantly
    })
  }

  addDevice(device:Device){
    this.http.post<Device>(this.apiUrl+'/save',device).subscribe((newDevice)=>{ 
      //get the current list,add the new device and emit updated list
      const currentDevices=this.devicesSubject.value;
      this.devicesSubject.next([...currentDevices,newDevice])
    })
  }


 


 
 


}
