import { Component, inject, signal, computed } from '@angular/core'; // Added signal, computed
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device/device.service';
import { ShelfService } from '../../services/shelf/shelf.service';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';
import { LoaderService } from '../../services/loader/loader.service';
import { ToastService } from '../../services/toast/toast.service'; // Added ToastService
import { LoaderComponent } from '../../components/loader/loader.component';
import { ToastComponent } from '../../components/toast/toast.component'; // Added ToastComponent

@Component({
  selector: 'app-home',
  standalone: true, // Assuming standalone like others
  imports: [RouterLink, LoaderComponent, ToastComponent], // Added ToastComponent
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Signals for totals (reactive state)
  totalDevices = signal(0);
  totalShelves = signal(0);
  totalShelfPositions = signal(0);

  // Inject services
  private loaderService = inject(LoaderService); // Fixed typo from loaderSerivce
  private deviceService = inject(DeviceService);
  private shelfService = inject(ShelfService);
  private shelfPositionService = inject(ShelfpositionService);
  private toastService = inject(ToastService); // Added for error feedback

  // Computed signals directly from service Signals (no subscriptions needed)
  devicesCount = computed(() => this.deviceService.devices().length);
  shelvesCount = computed(() => this.shelfService.shelves().length);
  shelfPositionsCount = computed(() => this.shelfPositionService.shelfPositions().length);

  ngOnInit() {
    this.loaderService.show(); // Show loader while fetching

    // Fetch all data with error handling
    this.deviceService.fetchAllDevices().subscribe({
      next: () => {
        this.loaderService.hide()
        this.totalDevices.set(this.devicesCount()); // Update Signal with computed value
      },
      error: (err) => {
        this.loaderService.hide(); // Hide loader on error
        this.toastService.show(`Failed to fetch devices: ${err.message}`, 'error');
      },
    });

    this.shelfService.fetchAllShelves().subscribe({
      next: () => {
        this.loaderService.hide()
        this.totalShelves.set(this.shelvesCount()); // Update Signal with computed value
      },
      error: (err) => {
        this.loaderService.hide(); // Hide loader on error
        this.toastService.show(`Failed to fetch shelves: ${err.message}`, 'error');
      },
    });

    this.shelfPositionService.fetchAllShelfPositions().subscribe({
      next: () => {
        this.loaderService.hide(); // Hide loader only after all fetches succeed
        this.totalShelfPositions.set(this.shelfPositionsCount()); // Update Signal with computed value
      },
      error: (err) => {
        this.loaderService.hide(); // Hide loader on error
        this.toastService.show(`Failed to fetch shelf positions: ${err.message}`, 'error');
      },
    });
  }
}