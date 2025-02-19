import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelfpositionDetailsComponent } from './shelfposition-details.component';

describe('ShelfpositionDetailsComponent', () => {
  let component: ShelfpositionDetailsComponent;
  let fixture: ComponentFixture<ShelfpositionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelfpositionDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelfpositionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
