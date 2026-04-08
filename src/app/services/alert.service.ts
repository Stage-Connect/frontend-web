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

  /** Confirmation avant validation entreprise (file admin). */
  async confirmCompanyVerificationApprove(companyName: string): Promise<boolean> {
    const theme = this.getThemeTokens();
    const result = await Swal.fire({
      title: 'Approuver cette entreprise ?',
      text: `Confirmer la validation du dossier : ${companyName}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, approuver',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.success,
      cancelButtonColor: theme.secondary
    });
    return result.isConfirmed;
  }

  /**
   * Confirmation avant rejet : motif obligatoire (min. 10 caractères, aligné backend).
   * @param prefill texte optionnel (ex. depuis le formulaire détail)
   * @returns le motif saisi, ou null si annulation
   */
  async confirmCompanyVerificationReject(companyName: string, prefill = ''): Promise<string | null> {
    const theme = this.getThemeTokens();
    const result = await Swal.fire({
      title: 'Rejeter ce dossier ?',
      html: `Indiquez le <strong>motif du rejet</strong> pour : ${this._escapeHtml(companyName)}<br/><span class="small opacity-75">Minimum 10 caractères.</span>`,
      icon: 'warning',
      input: 'textarea',
      inputValue: prefill,
      inputPlaceholder: 'Motif du rejet (obligatoire)...',
      inputAttributes: { 'aria-label': 'Motif du rejet', rows: '4' },
      showCancelButton: true,
      confirmButtonText: 'Rejeter le dossier',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.danger,
      cancelButtonColor: theme.secondary,
      focusCancel: true,
      preConfirm: (value) => {
        const v = String(value ?? '').trim();
        if (v.length < 10) {
          Swal.showValidationMessage('Le motif doit contenir au moins 10 caractères.');
          return false;
        }
        return v;
      }
    });
    if (result.isConfirmed && typeof result.value === 'string') {
      return result.value.trim();
    }
    return null;
  }

  private _escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
