import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  success(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire(title, text, 'success');
  }

  error(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire(title, text, 'error');
  }

  info(title: string, text: string): Promise<SweetAlertResult> {
    return this.fire(title, text, 'info');
  }

  async confirmLogout(): Promise<boolean> {
    const theme = this.getThemeTokens();
    const result = await Swal.fire({
      title: 'Se déconnecter ?',
      text: 'La session active va être fermée sur cette interface.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, me déconnecter',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.danger,
      cancelButtonColor: theme.secondary
    });

    return result.isConfirmed;
  }

  private fire(title: string, text: string, icon: SweetAlertIcon): Promise<SweetAlertResult> {
    const theme = this.getThemeTokens();
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      background: theme.background,
      color: theme.color,
      confirmButtonColor: icon === 'success'
        ? theme.success
        : icon === 'error'
          ? theme.danger
          : theme.primary
    });
  }

  private getThemeTokens(): {
    background: string;
    color: string;
    primary: string;
    success: string;
    secondary: string;
    danger: string;
  } {
    const styles = getComputedStyle(document.documentElement);
    return {
      background: styles.getPropertyValue('--cui-body-bg').trim() || '#ffffff',
      color: styles.getPropertyValue('--cui-body-color').trim() || '#1a222c',
      primary: styles.getPropertyValue('--cui-primary').trim() || '#004a99',
      success: styles.getPropertyValue('--cui-success').trim() || '#2eb85c',
      secondary: styles.getPropertyValue('--cui-secondary').trim() || '#6c757d',
      danger: styles.getPropertyValue('--cui-danger').trim() || '#dc3545'
    };
  }
}
