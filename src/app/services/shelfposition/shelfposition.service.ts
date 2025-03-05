import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Injector, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { Shelfposition } from '../../../interface/shelfposition';
import { DeviceService } from '../device/device.service';
import { ShelfService } from '../shelf/shelf.service';

@Injectable({
  providedIn: 'root',
})
export class ShelfpositionService {
  private apiUrl = 'http://localhost:8080/shelfposition';
  private injector = inject(Injector);
  constructor(private http: HttpClient) {}
  private shelvesPositionsFetched = false;

  private get deviceService(): DeviceService {
    return this.injector.get(DeviceService); //Dynamically get DeviceService
  }

  private get shelfService(): ShelfService {
    return this.injector.get(ShelfService); //Dynamically get DeviceService
  }

  shelfPositionsSignal = signal<Shelfposition[]>([]);
  shelfPositions = this.shelfPositionsSignal.asReadonly();

  fetchAllShelfPositions(): Observable<Shelfposition[]> {
    if (this.shelvesPositionsFetched) return of(this.shelfPositions());
    return this.http
      .get<Shelfposition[]>(this.apiUrl + '/getAllShelfPositions')
      .pipe(
        catchError(this.handleError),
        tap((shelfPositions) => {
          this.shelfPositionsSignal.set(shelfPositions);
          this.shelvesPositionsFetched = true;
        })
      );
  }

  addPosition(shelfPosition: Shelfposition): Observable<Shelfposition> {
    return this.http
      .post<Shelfposition>(this.apiUrl + '/save', shelfPosition)
      .pipe(
        catchError(this.handleError),
        tap((newPosition) => {
          this.shelfPositionsSignal.update((current) => [
            ...current,
            newPosition,
          ]);
        })
      );
  }

  getShelfPositionById(id: number) {
    return this.http.get<Shelfposition>(`${this.apiUrl}/${id}`);
  }

  updateShelfPosition(shelPosition: Shelfposition): Observable<Shelfposition> {
    return this.http
      .put<Shelfposition>(
        `${this.apiUrl}/update/${shelPosition.id}`,
        shelPosition
      )
      .pipe(
        catchError(this.handleError),
        tap((updatedPosition) => {
          this.shelfPositionsSignal.update((current) =>
            current.map((sp) =>
              sp.id === updatedPosition.id ? updatedPosition : sp
            )
          );
        })
      );
  }

  deleteShelfPosition(shelfPositionId: number) {
   return this.http.delete(`${this.apiUrl}/delete/${shelfPositionId}`).pipe(
    catchError(this.handleError),
    tap(()=>{
       //now we have to do 3 things,remove this shelfPosition from the signal which is holding all shelves,remove shelfPosition from it's device and from it's shelf
       const allShelfPositions=this.shelfPositionsSignal()
       const targetShelfPosition=allShelfPositions.find((sp)=>sp.id===shelfPositionId)
       //removed the shelfPosition from signal
       this.shelfPositionsSignal.update((current)=>current.filter((sp)=>sp.id!=shelfPositionId))
     
       //NOW IF SHELF POSITION HAS DEVICE CHANGE IT
       if(targetShelfPosition && targetShelfPosition.device){
        const allDevices=this.deviceService.devices()
        const targetDevice=allDevices.find((d)=>d.id===targetShelfPosition.device?.id)
        if(targetDevice){
          targetDevice.shelfPositions=targetDevice.shelfPositions?.filter((sp)=>sp.id!==shelfPositionId)
          this.deviceService.devicesSignal.set([...allDevices])
        }
       } 

      //MAKE CHANGES TO ASSOCIATED SHELF IF EXISTS
      if(targetShelfPosition && targetShelfPosition.shelf){
        const allShelves=this.shelfService.shelves()
        const targetShelf=allShelves.find((s)=>s.id===targetShelfPosition.shelf?.id)
        if(targetShelf){
          targetShelf.shelfPosition=undefined
          this.shelfService.shelfSignal.set([...allShelves])
        }
      } 

       

    })
   )
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
    console.error('Error in ShelfPosition Serice:', {
      message: errorMessage,
      originalError: error,
    });

    // Throw the formatted message as an observable error
    return throwError(() => new Error(errorMessage));
  }
}
