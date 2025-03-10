
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Injector, signal } from '@angular/core';
import { Observable, catchError, throwError, tap, of } from 'rxjs';
import { Shelf } from '../../../interface/shelf';
import { ShelfpositionService } from '../shelfposition/shelfposition.service';

@Injectable({
  providedIn: 'root' // App-wide service
})
export class ShelfService {
  private apiUrl = 'http://localhost:8080/shelf'; // Base URL for shelf API
  private shelvesFetched = false; // Flag to prevent duplicate fetches

  
  shelfSignal = signal<Shelf[]>([]); //will hold all the list of shelves
  shelves = this.shelfSignal.asReadonly();   //read only to be used in other places in the app

  private injector = inject(Injector); //to prevent circular dependency
  private get shelfPositionService(): ShelfpositionService {
    return this.injector.get(ShelfpositionService);
  }

  constructor(private http: HttpClient) {} // Inject HttpClient

  // Fetch all shelves from the backend
  fetchAllShelves(): Observable<Shelf[]> {
    if (this.shelvesFetched) return of(this.shelfSignal()) //if already fetched return the current shelves as an observable,this of operator creates as observable from current shelves 
    return this.http.get<Shelf[]>(`${this.apiUrl}/getAllShelves`).pipe(
      catchError(this.handleError), 
      tap((shelves) => { 
        this.shelfSignal.set(shelves); 
        this.shelvesFetched = true; 
      })
    );
  }

  // Add a new shelf
  addShelf(shelf: Shelf): Observable<Shelf> {
    return this.http.post<Shelf>(`${this.apiUrl}/save`, shelf).pipe(
      catchError(this.handleError), 
      tap((newShelf) => { 
        this.shelfSignal.update((current) => [...current, newShelf]); //update your signal which acts as single source of truth
      })
    );
  }

  getShelfById(id: number): Observable<Shelf> {
    return this.http.get<Shelf>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError) 
    );
  }

  // Update an existing shelf
  updateShelf(shelf: Shelf): Observable<Shelf> {
    return this.http.put<Shelf>(`${this.apiUrl}/update/${shelf.id}`, shelf).pipe(
      catchError(this.handleError), 
      tap((updatedShelf) => { 
        this.shelfSignal.update((current) =>
          current.map((s) => (s.id === updatedShelf.id ? updatedShelf : s)) // Replace updated shelf
        );
      })
    );
  }

  // Assign a shelf position to a shelf
  addShelfPosition(shelfId: number, shelfPositionId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${shelfId}/addShelfPosition/${shelfPositionId}`, {}).pipe(
      catchError(this.handleError), 
      tap(() => { 
        const allShelfPositions = this.shelfPositionService.shelfPositions(); 
        const targetShelfPosition = allShelfPositions.find((sp) => sp.id === shelfPositionId); 
        if (targetShelfPosition) {
          const allShelves = this.shelfSignal(); // Get current shelves
          const targetShelf = allShelves.find((s) => s.id === shelfId); // Find target shelf
          if (targetShelf) {
            targetShelfPosition.shelf = targetShelf; // Link shelf to position
            targetShelf.shelfPosition = targetShelfPosition; // Link position to shelf
            this.shelfSignal.set([...allShelves]); // Update Shelf Signal
            this.shelfPositionService.shelfPositionsSignal.set([...allShelfPositions]); // Update Shelfposition Signal
          }
        }
      })
    );
  }

  // Delete a shelf by ID
  deleteShelf(shelfId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${shelfId}`).pipe(
      catchError(this.handleError), 
      tap(() => {
        const targetShelf = this.shelfSignal().find((s) => s.id === shelfId);
        this.shelfSignal.update((current) => current.filter((s) => s.id !== shelfId)); 

        // Free up the shelf position if it exists
        const allShelfPositions = this.shelfPositionService.shelfPositions();
        const targetShelfPosition = allShelfPositions.find((sp) => sp.id === targetShelf?.shelfPosition?.id);
        if (targetShelfPosition) {
          targetShelfPosition.shelf = undefined; // Clear shelf reference
          this.shelfPositionService.shelfPositionsSignal.set([...allShelfPositions]); // Update Signal
        }
      })
    );
  }

  // Remove a shelf position from a shelf
  removeShelfPosition(shelfId: number, shelfPositionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${shelfId}/removeShelfPosition/${shelfPositionId}`).pipe(
      catchError(this.handleError), // Handle DELETE errors
      tap(() => { // On success
        const allShelves = this.shelfSignal(); // Get current shelves
        const targetShelf = allShelves.find((s) => s.id === shelfId); // Find target shelf
        if (targetShelf) {
          targetShelf.shelfPosition = undefined; // Clear position
          this.shelfSignal.set([...allShelves]); // Update Signal
        }

        const allShelfPositions = this.shelfPositionService.shelfPositions(); // Get shelf positions
        const targetShelfPosition = allShelfPositions.find((sp) => sp.id === shelfPositionId); // Find target position
        if (targetShelfPosition) {
          targetShelfPosition.shelf = undefined; // Clear shelf link
          this.shelfPositionService.shelfPositionsSignal.set([...allShelfPositions]); // Update Signal
        }
      })
    );
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
