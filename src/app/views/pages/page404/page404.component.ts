import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  ColComponent,
  ContainerComponent,
  RowComponent,
  ColorModeService
} from '@coreui/angular';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, IconDirective, ButtonDirective, RouterLink]
})
export class Page404Component {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
}
