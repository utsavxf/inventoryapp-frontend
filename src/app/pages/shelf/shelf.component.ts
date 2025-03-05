import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ShelfService } from '../../services/shelf/shelf.service';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';
import { Shelf } from '../../../interface/shelf';
import { Shelfposition } from '../../../interface/shelfposition';
import { LoaderService } from '../../services/loader/loader.service';
import { ToastService } from '../../services/toast/toast.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-shelf',
  standalone: true, // Standalone component
  imports: [FormsModule, CommonModule, RouterLink, ModalModule, LoaderComponent, ToastComponent], // Added Loader and Toast components
  providers: [BsModalService], // Modal service provider
  templateUrl: './shelf.component.html',
  styleUrl: './shelf.component.scss',
})
export class ShelfComponent {

  shelves = inject(ShelfService).shelves;

  newShelf = signal<Shelf>({ name: '', type: '' });
  showAddForm = signal(false);
  editingShelf = signal<Shelf>({ name: '', type: '' });
  assigningShelf = signal<Shelf>({ name: '', type: '' });
  selectedShelfPositionId = signal('');
  
  modalRef?: BsModalRef;

  // Signal for shelf positions from service
  shelfPositions = inject(ShelfpositionService).shelfPositions;
  // Computed Signal for available shelf positions (no shelf assigned)
  availableShelfPositions = computed(() => this.shelfPositions().filter((sp) => !sp.shelf));

  // Inject services
  private shelfService = inject(ShelfService);
  private shelfPositionService = inject(ShelfpositionService);
  private modalService = inject(BsModalService);
  private loaderService = inject(LoaderService);
  private toastService = inject(ToastService);

  // Initialize on component load
  ngOnInit(): void {
    this.fetchAllShelves(); // Fetch shelves
    this.shelfPositionService.fetchAllShelfPositions()
    .subscribe({
      next:()=>this.loaderService.hide(),
      error:()=>this.toastService.show(`Failed to fetch all shelf positions`,"error")
    })
  }

  // Toggle add form visibility
  toggleAddForm(): void {
    this.showAddForm.update((val) => !val);
  }

  // Fetch all shelves from service
  fetchAllShelves() {
    this.loaderService.show(); // Show loader
    this.shelfService.fetchAllShelves().subscribe({
      next: () => this.loaderService.hide(), // Hide loader on success
      error: (err) => {
        this.loaderService.hide();
        this.toastService.show(err.message, 'error'); // Show error toast
      },
    });
  }

  // Add a new shelf
  addShelf(): void {
    this.loaderService.show(); 
    this.shelfService.addShelf(this.newShelf()).subscribe({
      next: () => { 
        this.toastService.show('Shelf added successfully', 'success');
        this.newShelf.set({ name: '', type: '' }); 
        this.showAddForm.set(false); 
        this.loaderService.hide();
      },
      error: (err) => { 
        this.toastService.show(err.message, 'error');
        this.loaderService.hide();
      },
    });
  }

  // Open edit modal with shelf data
  openEditShelfDialog(shelf: Shelf, template: TemplateRef<any>): void {
    this.editingShelf.set({ ...shelf }); 
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); 
  }

  // Open assign shelf position modal
  openAssignShelfPositionDialog(shelf: Shelf, template: TemplateRef<any>): void {
    this.selectedShelfPositionId.set(''); 
    this.assigningShelf.set({ ...shelf }); 
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); // Show modal
  }

  // Update the shelf
  updateShelf(): void {
    this.loaderService.show(); 
    this.shelfService.updateShelf(this.editingShelf()).subscribe({
      next: () => { 
        this.toastService.show('Shelf updated successfully', 'success');
        this.modalRef?.hide(); 
        this.loaderService.hide();
      },
      error: (err) => { 
        this.toastService.show(err.message, 'error');
        this.loaderService.hide();
      },
    });
  }

  // Assign a shelf position to the shelf
  assignShelfPosition() {
    this.loaderService.show(); 
    this.shelfService
      .addShelfPosition(Number(this.assigningShelf().id), Number(this.selectedShelfPositionId()))
      .subscribe({
        next: () => { 
          this.toastService.show('Shelf position assigned successfully', 'success');
          this.modalRef?.hide(); 
          this.loaderService.hide();
        },
        error: (err) => { 
          this.toastService.show(err.message, 'error');
          this.loaderService.hide();
        },
      });
  }

  // Delete a shelf with confirmation
  deleteShelf(shelf: Shelf) {
    if (confirm('Are you sure you want to delete this shelf?')) { // Confirm with user
      this.loaderService.show(); 
      this.shelfService.deleteShelf(Number(shelf.id)).subscribe({
        next: () => { 
          this.toastService.show('Shelf deleted successfully', 'success');
          this.loaderService.hide();
        },
        error: (err) => { 
          this.toastService.show(err.message, 'error');
          this.loaderService.hide();
        },
      });
    }
  }

  
  removeShelfPosition(event: MouseEvent, shelfId: any, shelfPositionId: any) {
    event.stopPropagation(); // Prevent router link trigger
    this.loaderService.show(); 
    this.shelfService.removeShelfPosition(Number(shelfId), Number(shelfPositionId)).subscribe({
      next: () => { 
        this.toastService.show('Shelf position removed successfully', 'success');
        this.loaderService.hide();
      },
      error: (err) => { 
        this.toastService.show(err.message, 'error');
        this.loaderService.hide();
      },
    });
  }
}
