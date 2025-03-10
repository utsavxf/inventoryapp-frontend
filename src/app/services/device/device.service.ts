import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Injector, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import { Device } from '../../../interface/device';
import { ShelfpositionService } from '../shelfposition/shelfposition.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private apiUrl = 'http://localhost:8080/device'; //base url for devices in our backend

  

  constructor(private http: HttpClient) {} //to send http request from our frontend to our backend
  private deviceFetched = false;

  private injector = inject(Injector); //to avoid circular dependency error
  private get shelfPositionService(): ShelfpositionService {
    return this.injector.get(ShelfpositionService);
  }
  
  //Signal for devices
  devicesSignal=signal<Device[]>([])
  //Public read-only signal
  devices=this.devicesSignal.asReadonly()

  //get all devices from the backend
  fetchAllDevices(): Observable<Device[]> {
    if (this.deviceFetched) return of(this.devices()) //return the already cached devices as an observable
    return this.http
      .get<Device[]>(this.apiUrl + '/getAllDevices') //now this http request itself returns observable so deviceSubject here acts as consumer to subscribe to this observable and updates itself with data
      .pipe(
        catchError(this.handleError),
        tap((devices) => {
          this.devicesSignal.set(devices) //updating signal
          this.deviceFetched = true;
        })
      );
  }

  //adding a device
  addDevice(device: Device): Observable<Device> {
    return this.http.post<Device>(this.apiUrl + '/save', device).pipe(
      catchError(this.handleError),
      tap((newDevice) => {
         //simply add the new device to the deviceSignal
         this.devicesSignal.update((current)=>[...current,newDevice])
      })
    );
  }

  //getting a device by id
  getDeviceById(id: number) {
    return this.http.get<Device>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  //updating a deice
  updateDevice(device: Device): Observable<Device> {
    return this.http
      .put<Device>(`${this.apiUrl}/update/${device.id}`, device)
      .pipe(
        catchError(this.handleError),
        tap((updatedDevice) => {
          //update the new device
          this.devicesSignal.update((current)=>current.map((d)=>d.id===updatedDevice.id?updatedDevice:d))
        })
      );
  }

  //deleting a device
  deleteDevice(deviceId: number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/delete/${deviceId}`).pipe(
      catchError(this.handleError),
      tap(()=>{
        //couple of things need to be done here,we need to free all the shelfPositions that have this device as a reference

        //first removing this device from devicesSignal
        this.devicesSignal.update((current)=>current.filter((d)=>d.id!==deviceId))
        
        //device must be set to undefined in all respective shelfPositions
        const shelfPositions=this.shelfPositionService.shelfPositions();
        shelfPositions.forEach((sp)=>{
          if(sp.device?.id===deviceId)sp.device=undefined
        })

        this.shelfPositionService.shelfPositionsSignal.set([...shelfPositions])
      })
    );
  }


  //adding a shelf position
  addShelfPosition(deviceId: number, shelfPositionId: number):Observable<any>{
    return this.http.post<void>(`${this.apiUrl}/${deviceId}/addShelfPosition/${shelfPositionId}`,{})
    .pipe(catchError(this.handleError),
  tap(()=>{
    //finding the target shelfPosition 
    const shelfPositions=this.shelfPositionService.shelfPositions()
    const targetShelfPosition=shelfPositions.find((sp)=>sp.id===shelfPositionId)
    
    //finding the target device
    const devices=this.devicesSignal()
    const targetDevice=devices.find((d)=>d.id===deviceId)


    if(targetDevice && targetShelfPosition){
      //now adding shelfPosition to device and updating the signal
      targetDevice.shelfPositions?.push(targetShelfPosition)
      //adding device reference to shelfPosition
      targetShelfPosition.device=targetDevice   
    }

    //now we have to update both the signals
    this.devicesSignal.set([...devices])
    this.shelfPositionService.shelfPositionsSignal.set([...shelfPositions])
  }))
  }
  
  //removing a particular shelf position
  removeShelfPosition(deviceId: number, shelfPositionId: number):Observable<any>{
    return this.http.delete<void>(`${this.apiUrl}/${deviceId}/removeShelfPosition/${shelfPositionId}`)
    .pipe(catchError(this.handleError),
  tap(()=>{
     const allDevices=this.devicesSignal();
     const targetDevice=allDevices.find((d)=>d.id===deviceId)

     const allShelfPositions=this.shelfPositionService.shelfPositions()
     const targetShelfPosition=allShelfPositions.find((sp)=>sp.id===shelfPositionId)

     if(targetDevice && targetShelfPosition){
       targetDevice.shelfPositions=targetDevice.shelfPositions?.filter((sp)=>sp.id!==shelfPositionId)
       targetShelfPosition.device=undefined
     }

     this.devicesSignal.set([...allDevices])
     this.shelfPositionService.shelfPositionsSignal.set([...allShelfPositions])



  }))
  }

  // Error handling method
  private handleError(error: any): Observable<never> { //never means it will not return any data,will simply return error which will be catched by component
    let errorMessage: string;

    // Server-side errors 
     if (error instanceof HttpErrorResponse) {
      console.log(error)
      switch (error.status) {
        case 0:
          errorMessage =
            'No connection to the server. Check your internet or try again later.';
          break;
        case 400:
          errorMessage="Bad Request: Invalid data";
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in to access this resource.';
          break;
        case 403:
          errorMessage = 'Forbidden: You don’t have permission to do this.';
          break;
        case 404:
          errorMessage = `Not found: ${
            error.error
          }`;
          break;
        
        case 409: //Http conflict
          errorMessage=error.error
          break;
        case 500:
          errorMessage =
            'Server error: Something broke on our end. Try again later.';
          break;
        default:
          errorMessage = `Unexpected server error: ${error.status} - ${
            error.statusText || 'Unknown issue.'
          }`;
      }
    }
    else {
      errorMessage = 'An unexpected error occurred. Please try again.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
