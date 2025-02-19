import { Component, inject } from '@angular/core';
import { Shelfposition } from '../../../interface/shelfposition';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shelfposition-details',
  imports: [],
  templateUrl: './shelfposition-details.component.html',
  styleUrl: './shelfposition-details.component.scss'
})
export class ShelfpositionDetailsComponent {
  shelfPosition:Shelfposition={
    name:''
  }

  shelfPositionService=inject(ShelfpositionService)
  private route=inject(ActivatedRoute)

  ngOnInit(){
    this.route.paramMap.subscribe((params)=>{
      const id=params.get('id')
      if(id){
        this.fetchShelfPosition(Number(id))  
      }
    })
  }

  fetchShelfPosition(id:number){
    this.shelfPositionService.getShelfPositionById(id).subscribe((shelfPosition)=>{
      this.shelfPosition=shelfPosition
    })

    
  }

}
