import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Device } from '../../../interface/device';
import { ShelfpositionService } from '../shelfposition/shelfposition.service';

@Injectable({
  providedIn: 'root'
})



export class DeviceService {

  private apiUrl='http://localhost:8080/device'; //base url for devices in our backend

  private injector=inject(Injector) 
  
  constructor(private http:HttpClient) { } //to send http request from our frontend to our backend 
  private deviceFetched=false

  private get shelfPositionService():ShelfpositionService{
    return this.injector.get(ShelfpositionService)
  }

  //We can say that observables handles streams of async data like API responses,user inputs and act like event emitters,pushing data to whoever subscribes to them

  /*deviceSubject holds all devices but device$ is just an observable that exposes the current value of deviceSubject
  devices$ is just like a read only stream of the data so that components/observers can subscribe to it where we need it*/
  
   devicesSubject = new BehaviorSubject<Device[]>([]); // BehaviorSubject to hold devices
  devices$ = this.devicesSubject.asObservable(); // Observable to expose devices

  fetchAllDevices(){
    if(this.deviceFetched)return //no need to fetch again,prevents extra api call
    this.http.get<Device[]>(this.apiUrl+'/getAllDevices') //now this http request itself returns observable so deviceSubject here acts as consumer to subscribe to this observable and updates itself with data
    .pipe(catchError(this.handleError))
    .subscribe((devices)=>{
      this.devicesSubject.next(devices); //this line serves 2 purpose :updating the deviceSubject with and notifying subscribers/other components ,so that all the components that subscribed to devices$ gets the updated list instantly
      this.deviceFetched=true
    })
  }

  addDevice(device:Device){
    this.http.post<Device>(this.apiUrl+'/save',device).pipe(
      catchError(this.handleError)
    ).
    subscribe((newDevice)=>{ 
      //get the current list,add the new device and emit updated list
      const currentDevices=this.devicesSubject.value;
      this.devicesSubject.next([...currentDevices,newDevice])
      //the above 2 line can be written outside the block also ,it will also give same results right? Suppose the above post request failed and on the backend we aren't able to add any new device but we still added locally in behaviour subject so that would be wrong that's why we do these changes in subsribe from the observable
    })
  }

  getDeviceById(id:number){
    return this.http.get<Device>(`${this.apiUrl}/${id}`)
  }

  updateDevice(device:Device){
    this.http.put<Device>(`${this.apiUrl}/update/${device.id}`,device).pipe(
      catchError(this.handleError)
    ).subscribe((device)=>{
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
    
    //we wanna do 2 things,push shelfPosition into device and attach device to the shelfPosition
    //but we need to update everything in subjects so that the whole application is in sync with the backend and we don't have to do additional http requests
    
    const shelfPositions=this.shelfPositionService.shelfPositionSubject.value
    const targetShelfPosition = shelfPositions.find((sp)=>sp.id===shelfPositionId)
      if(targetShelfPosition){ //when using find operation,there is always a probability that what if the respective entity was not found
      this.http.post(`${this.apiUrl}/${deviceId}/addShelfPosition/${shelfPositionId}`,{}).pipe(
        catchError(this.handleError)
      ).
      subscribe(()=>{
       const currentDevices=this.devicesSubject.value
       const deviceIndex=currentDevices.findIndex((d)=>d.id===deviceId)
       currentDevices[deviceIndex].shelfPositions?.push(targetShelfPosition) //updating the currentDevice
       targetShelfPosition.device=currentDevices[deviceIndex] //updating the shelfPosition
       //now we have to emit the next functions from both the subjects to carry the updates throughout the application
       this.devicesSubject.next([...currentDevices])
       this.shelfPositionService.shelfPositionSubject.next([...shelfPositions])
      },
    )
  }
   
    
   
  }

  deleteDevice(deviceId: number) { 
    this.http.delete(`${this.apiUrl}/delete/${deviceId}`).subscribe(() => {
        // Remove the device from the local BehaviorSubject
        const currentDevices = this.devicesSubject.value.filter(d => d.id !== deviceId);
        this.devicesSubject.next([...currentDevices]);

        // Also, update the shelf positions to remove the reference to the deleted device
        const shelfPositions = this.shelfPositionService.shelfPositionSubject.value;
        
        // Iterate through shelf positions and remove the reference to the deleted device
        shelfPositions.forEach(sp => {
            if (sp.device && sp.device.id === deviceId) {
                sp.device = undefined; // or delete the device property, depending on your model
            }
        }); 

        // Emit the updated shelf positions to the shelf position subject
        this.shelfPositionService.shelfPositionSubject.next([...shelfPositions]);
    }, (error) => {
        console.error('Error deleting device:', error);
        // Optionally handle the error (e.g., show a notification)
    });
}

 removeShelfPosition(deviceId:number,shelfPositionId:number){
   this.http.delete(`${this.apiUrl}/${deviceId}/removeShelfPosition/${shelfPositionId}`).pipe(
    catchError(this.handleError)
   ).subscribe(()=>{
    //do changes to device and emit to all other subscribers
    const allDevices=this.devicesSubject.value
    const targetDevice=allDevices.find((d)=>d.id===deviceId)
    if(targetDevice)
    targetDevice.shelfPositions=targetDevice?.shelfPositions?.filter((sp)=>sp.id!==shelfPositionId)
    this.devicesSubject.next([...allDevices])

    //do changes to shelfPosition and emit to all other subscibers
    const allShelfPositions=this.shelfPositionService.shelfPositionSubject.value
    const targetShelfPosition=allShelfPositions.find((sp)=>sp.id===shelfPositionId)
    if(targetShelfPosition)targetShelfPosition.device=undefined
    this.shelfPositionService.shelfPositionSubject.next([...allShelfPositions])
   })
 }


  // Error handling method
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error); // Log the error to the console
    return throwError(() => new Error('Something went wrong; please try again later.')); // Return an observable with a user-facing error message
  }
 


 
 


}
