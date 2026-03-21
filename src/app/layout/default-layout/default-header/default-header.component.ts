import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AvatarComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective, HeaderNavComponent, NavItemComponent, NavLinkDirective, RouterLink, NgTemplateOutlet, BreadcrumbRouterComponent, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective, DropdownHeaderDirective, DropdownItemDirective, DropdownDividerDirective, AsyncPipe, NotificationDropdownComponent]
})
export class DefaultHeaderComponent extends HeaderComponent {

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });
  readonly profileRoute = computed(() => this.auth.getUserRole() === 'admin' ? '/dashboard' : '/dashboard/entreprise/profil');
  readonly dropdownHeader = computed(() => this.auth.getUserRole() === 'admin' ? 'ADMINISTRATION' : 'ESPACE ENTREPRISE');

  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  public user$ = this.auth.user$;

  constructor() {
    super();
  }

  sidebarId = input('sidebar1');

  async logout(): Promise<void> {
    const confirmed = await this.alerts.confirmLogout();
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: async (remoteLogoutSucceeded) => {
        if (!remoteLogoutSucceeded) {
          await this.alerts.info(
            'Déconnexion locale',
            'Le backend n’a pas confirmé la fermeture de session, mais la session locale a bien été supprimée.'
          );
        }
      }
    });
  }
}
