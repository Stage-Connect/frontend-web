import { Component, signal, computed } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective
  ]
})
export class DefaultLayoutComponent {
  isNarrow = false;
  isUnfoldable = false;
  private userRoleSignal = signal<string | null>(null);
  readonly navItems = computed(() => {
    const role = this.userRoleSignal();
    return navItems.filter(item => !item.role || item.role === role);
  });

  constructor(private auth: AuthService) {
    this.userRoleSignal.set(this.auth.getUserRole());
    this.auth.user$.subscribe(() => {
      this.userRoleSignal.set(this.auth.getUserRole());
    });
  }

  onNarrowChange(event: boolean) {
    this.isNarrow = event;
  }

  onUnfoldableChange(event: boolean) {
    this.isUnfoldable = event;
  }
}
