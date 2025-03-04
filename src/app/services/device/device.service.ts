import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Device } from '../../../interface/device';
import { ShelfpositionService } from '../shelfposition/shelfposition.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private apiUrl = 'http://localhost:8080/device'; //base url for devices in our backend

  private injector = inject(Injector); //to avoid circular dependency error

  constructor(private http: HttpClient) {} //to send http request from our frontend to our backend
  private deviceFetched = false;

  private get shelfPositionService(): ShelfpositionService {
    return this.injector.get(ShelfpositionService);
  }

  //We can say that observables handles streams of async data like API responses,user inputs and act like event emitters,pushing data to whoever subscribes to them

  /*deviceSubject holds all devices but device$ is just an observable that exposes the current value of deviceSubject
  devices$ is just like a read only stream of the data so that components/observers can subscribe to it where we need it*/

  devicesSubject = new BehaviorSubject<Device[]>([]); // BehaviorSubject to hold devices
  devices$ = this.devicesSubject.asObservable(); // Observable to expose devices

  //get all devices from the backend
  fetchAllDevices(): Observable<Device[]> {
    if (this.deviceFetched) return this.devices$; //no need to fetch again,prevents extra api call
    return this.http
      .get<Device[]>(this.apiUrl + '/getAllDevices') //now this http request itself returns observable so deviceSubject here acts as consumer to subscribe to this observable and updates itself with data
      .pipe(
        catchError(this.handleError),
        tap((devices) => {
          this.devicesSubject.next(devices); //this line serves 2 purpose :updating the deviceSubject with and notifying subscribers/other components ,so that all the components that subscribed to devices$ gets the updated list instantly
          this.deviceFetched = true;
        })
      );
  }

  //adding a device
  addDevice(device: Device): Observable<Device> {
    return this.http.post<Device>(this.apiUrl + '/save', device).pipe(
      catchError(this.handleError),
      tap((newDevice) => {
        //get the current list,add the new device and emit updated list
        const currentDevices = this.devicesSubject.value;
        this.devicesSubject.next([...currentDevices, newDevice]);
        //the above 2 line can be written outside the block also ,it will also give same results right? Suppose the above post request failed and on the backend we aren't able to add any new device but we still added locally in behaviour subject so that would be wrong that's why we do these changes in subsribe from the observable
      })
    );
  }

  //getting a device by id
  getDeviceById(id: number) {
    return this.http.get<Device>(`${this.apiUrl}/${id}`);
  }

  //updating a deice
  updateDevice(device: Device): Observable<Device> {
    return this.http
      .put<Device>(`${this.apiUrl}/update/${device.id}`, device)
      .pipe(
        catchError(this.handleError),
        tap((device) => {
          //ok so now particular device has been updated and we've been given the new device,now we want to update our behaviour subject
          const currentDevices = this.devicesSubject.value;
          const deviceIndex = currentDevices.findIndex(
            (d) => d.id === device.id
          );
          if (deviceIndex !== -1) {
            currentDevices[deviceIndex] = device;
            this.devicesSubject.next([...currentDevices]);
          }
        })
      );
  }

  //adding a shelf position
  addShelfPosition(deviceId: number, shelfPositionId: number) {
    //we wanna do 2 things,push shelfPosition into device and attach device to the shelfPosition
    //but we need to update everything in subjects so that the whole application is in sync with the backend and we don't have to do additional http requests

    const shelfPositions = this.shelfPositionService.shelfPositionSubject.value;
    const targetShelfPosition = shelfPositions.find(
      (sp) => sp.id === shelfPositionId
    );
    if (targetShelfPosition) {
      //when using find operation,there is always a probability that what if the respective entity was not found
      this.http
        .post(
          `${this.apiUrl}/${deviceId}/addShelfPosition/${shelfPositionId}`,
          {}
        )
        .pipe(catchError(this.handleError))
        .subscribe(() => {
          const currentDevices = this.devicesSubject.value;
          const deviceIndex = currentDevices.findIndex(
            (d) => d.id === deviceId
          );
          currentDevices[deviceIndex].shelfPositions?.push(targetShelfPosition); //updating the currentDevice
          targetShelfPosition.device = currentDevices[deviceIndex]; //updating the shelfPosition
          //now we have to emit the next functions from both the subjects to carry the updates throughout the application
          this.devicesSubject.next([...currentDevices]);
          this.shelfPositionService.shelfPositionSubject.next([
            ...shelfPositions,
          ]);
        });
    }
  }
  
  //deleting a device
  deleteDevice(deviceId: number){
    return this.http.delete(`${this.apiUrl}/delete/${deviceId}`).pipe(
      catchError(this.handleError),
      tap(() => {
        // Remove the device from the local BehaviorSubject
        const currentDevices = this.devicesSubject.value.filter(
          (d) => d.id !== deviceId
        );
        this.devicesSubject.next([...currentDevices]);

        // Also, update the shelf positions to remove the reference to the deleted device
        const shelfPositions =
          this.shelfPositionService.shelfPositionSubject.value;

        // Iterate through shelf positions and remove the reference to the deleted device
        shelfPositions.forEach((sp) => {
          if (sp.device && sp.device.id === deviceId) {
            sp.device = undefined; // or delete the device property, depending on your model
          }
        });

        // Emit the updated shelf positions to the shelf position subject
        this.shelfPositionService.shelfPositionSubject.next([
          ...shelfPositions,
        ]);
      })
    );
  }
  
  //removing a particular shelf position
  removeShelfPosition(deviceId: number, shelfPositionId: number) {
    this.http
      .delete(
        `${this.apiUrl}/${deviceId}/removeShelfPosition/${shelfPositionId}`
      )
      .pipe(catchError(this.handleError))
      .subscribe(() => {
        //do changes to device and emit to all other subscribers
        const allDevices = this.devicesSubject.value;
        const targetDevice = allDevices.find((d) => d.id === deviceId);
        if (targetDevice)
          targetDevice.shelfPositions = targetDevice?.shelfPositions?.filter(
            (sp) => sp.id !== shelfPositionId
          );
        this.devicesSubject.next([...allDevices]);

        //do changes to shelfPosition and emit to all other subscibers
        const allShelfPositions =
          this.shelfPositionService.shelfPositionSubject.value;
        const targetShelfPosition = allShelfPositions.find(
          (sp) => sp.id === shelfPositionId
        );
        if (targetShelfPosition) targetShelfPosition.device = undefined;
        this.shelfPositionService.shelfPositionSubject.next([
          ...allShelfPositions,
        ]);
      });
  }

  // Error handling method
  private handleError(error: any): Observable<never> {
    let errorMessage: string;

    // Client-side errors (e.g., network failure, bad request construction)
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network or client error: ${error.error.message}`;
    }
    // Server-side errors (e.g., 404, 500)
    else if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          errorMessage =
            'No connection to the server. Check your internet or try again later.';
          break;
        case 400:
          errorMessage = `Bad request: ${
            error.error?.message || 'Invalid data sent to the server.'
          }`;
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in to access this resource.';
          break;
        case 403:
          errorMessage = 'Forbidden: You don’t have permission to do this.';
          break;
        case 404:
          errorMessage = `Not found: ${
            error.error?.message || 'The requested resource doesn’t exist.'
          }`;
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
    // Fallback for weird errors
    else {
      errorMessage = 'An unexpected error occurred. Please try again.';
    }

    // Log the full error for debugging
    console.error('Error in DeviceService:', {
      message: errorMessage,
      originalError: error,
    });

    // Throw the formatted message as an observable error
    return throwError(() => new Error(errorMessage));
  }
}
