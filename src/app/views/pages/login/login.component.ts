import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  InputGroupComponent
} from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
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
  showPassword = false;

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private alerts: AlertService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      void this.alerts.error('Champs requis', this.errorMessage);
      return;
    }

    this.isLoggingIn = true;
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: async () => {
        this.isLoggingIn = false;
        await this.alerts.success('Connexion réussie', 'Votre session a bien été ouverte.');
        void this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse | Error) => {
        this.isLoggingIn = false;
        this.errorMessage = this.auth.getErrorMessage(err, 'Identifiants invalides. Veuillez réessayer.');
        void this.alerts.error('Échec de connexion', this.errorMessage);
      }
    });
  }
}
