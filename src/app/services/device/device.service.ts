import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { Device } from '../../../interface/device';

@Injectable({
  providedIn: 'root'
})



export class DeviceService {

  private apiUrl='http://localhost:8080/device'; //base url for devices in our backend

  
  constructor(private http:HttpClient) { } //to send http request from our frontend to our backend 


  //We can say that observables handles streams of async data like API responses,user inputs and act like event emitters,pushing data to whoever subscribes to them

  /*deviceSubject holds all devices but device$ is just an observable that exposes the current value of deviceSubject
  devices$ is just like a read only stream of the data so that components/observers can subscribe to it where we need it*/
  
  private devicesSubject = new BehaviorSubject<Device[]>([]); // BehaviorSubject to hold devices
  devices$ = this.devicesSubject.asObservable(); // Observable to expose devices

  fetchAllDevices(){
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

  getDeviceById(id:number){
    return this.http.get<Device>(`${this.apiUrl}/${id}`)
  }

  updateDevice(device:Device){
    this.http.put<Device>(`${this.apiUrl}/update/${device.id}`,device).subscribe((device)=>{
      //ok so now particular device has been updated and we've been given the new device,now we want to update our behaviour subject
      const currentDevices=this.devicesSubject.value
      const deviceIndex=currentDevices.findIndex(d=>d.id===device.id)
      if (deviceIndex !== -1) {
        currentDevices[deviceIndex] = device;
        this.devicesSubject.next([...currentDevices]);
      }
    })
  }
  //ALTERNATIVELY WE COULD HAVE ALSO DIRECTLY CALLED THE FETCH DEVICES FUNCTION AGAIN BUT THAT WOULD RESULT IN MAKING AN EXTRA API CALL THUS RESULTING IN SLOWER PERFORMANCE


  addShelfPosition(deviceId:number,shelfPositionId:number){
     return this.http.post(`${this.apiUrl}/${deviceId}/addShelfPosition/${shelfPositionId}`,{})
    
    //RAW REQUEST IS WORKING DON'T KNOW WHY
    // fetch(url,{method:'POST'}).then(response=>response.text()).then(data=>console.log(data)).catch(error=>console.log(error));
  }

  

  //this is one way of deleting but we will not be using this in other entities as it fetches all devices after deleting 1 device
  //in other approach we will locally update the change
  deleteDevice(deviceId:number){ 
     this.http.delete(`${this.apiUrl}/delete/${deviceId}`).subscribe(()=>{
      //ok so in the backend device is already deleted but we have to update it
       const currentDevices=this.devicesSubject.value.filter(d=>d.id!==deviceId);
       this.devicesSubject.next([...currentDevices])
     })
  }


 


 
 


}
