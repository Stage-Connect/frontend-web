import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  InputGroupComponent
} from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';
import { ColorModeService } from '@coreui/angular';
import { computed, inject } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    FormDirective, 
    InputGroupComponent, 
    IconDirective, 
    FormControlDirective, 
    ButtonDirective,
    FormsModule,
    RouterLink
  ],
  standalone: true
})
export class LoginComponent {
  email = '';
  password = '';

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Clair', icon: 'cilSun' },
    { name: 'dark', text: 'Sombre', icon: 'cilMoon' }
  ];

  readonly currentIcon = computed(() => {
    return this.colorMode() === 'dark' ? 'cilSun' : 'cilMoon';
  });

  toggleTheme() {
    const nextMode = this.colorMode() === 'dark' ? 'light' : 'dark';
    this.#colorModeService.colorMode.set(nextMode);
  }

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login(this.email, this.password).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
