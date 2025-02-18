import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Shelfposition } from '../../../interface/shelfposition';

@Injectable({
  providedIn: 'root'
})
export class ShelfpositionService {
  private apiUrl='http://localhost:8080/shelfposition'
  constructor(private http:HttpClient) { }

   shelfPositionSubject=new BehaviorSubject<Shelfposition[]>([]);
   shelfPositions$=this.shelfPositionSubject.asObservable();


  fetchShelfPositions(){
    this.http.get<Shelfposition[]>(this.apiUrl+'/getAllShelfPositions')
    .subscribe((shelfpositions)=>{
      this.shelfPositionSubject.next(shelfpositions)
    })
  }

  addPosition(shelfPosition:Shelfposition){
    this.http.post<Shelfposition>(this.apiUrl+'/save',shelfPosition)
    .subscribe((newShelfPosition)=>{
      const currentShelfPositions=this.shelfPositionSubject.value
      this.shelfPositionSubject.next([...currentShelfPositions,newShelfPosition])
    })
  }


}
