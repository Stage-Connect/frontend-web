import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  ColorModeService
} from '@coreui/angular';
import { computed, inject } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormDirective,
    InputGroupComponent,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    RouterLink,
    FormsModule
  ]
})
export class RegisterComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly currentIcon = computed(() => {
    return this.colorMode() === 'dark' ? 'cilSun' : 'cilMoon';
  });

  toggleTheme() {
    const nextMode = this.colorMode() === 'dark' ? 'light' : 'dark';
    this.#colorModeService.colorMode.set(nextMode);
  }
}
