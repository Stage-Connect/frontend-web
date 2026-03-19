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
  isLoggingIn = false;
  errorMessage = '';

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

  fillDemo(role: 'admin' | 'entreprise') {
    if (role === 'admin') {
      this.email = 'admin@stageconnect.cm';
      this.password = 'admin123';
    } else {
      this.email = 'entreprise@stageconnect.cm';
      this.password = 'entreprise123';
    }
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoggingIn = true;
    this.errorMessage = '';

    // Simulate network delay
    setTimeout(() => {
      this.auth.login(this.email, this.password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoggingIn = false;
          this.errorMessage = 'Identifiants invalides. Veuillez réessayer.';
          console.error('Login error:', err);
        }
      });
    }, 800);
  }
}
