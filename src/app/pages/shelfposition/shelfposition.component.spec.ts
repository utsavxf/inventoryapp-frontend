import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelfpositionComponent } from './shelfposition.component';

describe('ShelfpositionComponent', () => {
  let component: ShelfpositionComponent;
  let fixture: ComponentFixture<ShelfpositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelfpositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelfpositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
