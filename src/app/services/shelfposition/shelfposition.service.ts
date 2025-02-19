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


  fetchAllShelfPositions(){
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

  getShelfPositionById(id:number){
    return this.http.get<Shelfposition>(`${this.apiUrl}/${id}`)
  }

  updateShelfPosition(shelPosition:Shelfposition){
    this.http.put<Shelfposition>(`${this.apiUrl}/update/${shelPosition.id}`,shelPosition).subscribe((shelPosition)=>{
      const currentShelfPositions=this.shelfPositionSubject.value
      const targetIndex=currentShelfPositions.findIndex(sp=>sp.id===shelPosition.id)
      if(targetIndex!==-1){
        currentShelfPositions[targetIndex]=shelPosition
        this.shelfPositionSubject.next([...currentShelfPositions])
      }
    })
  }

  deleteShelfPosition(shelfPositionId:number){
    return this.http.delete(`${this.apiUrl}/delete/${shelfPositionId}`);
  }




}
