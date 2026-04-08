import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Declare global gtag function (injected via index.html snippet)
declare function gtag(...args: unknown[]): void;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  readonly #document = inject(DOCUMENT);

  private initialized = false;

  /**
   * Injects the gtag.js script for the given GA4 Measurement ID and sends the
   * initial config hit.  Call once at app startup (AppComponent.ngOnInit).
   * If measurementId is empty (e.g. development env), tracking is silently skipped.
   */
  init(measurementId: string): void {
    if (!measurementId || this.initialized) {
      return;
    }

    // Inject <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX">
    const script = this.#document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.#document.head.appendChild(script);

    // Configure the stream — disable automatic page_view since Angular SPA manages routing
    gtag('config', measurementId, { send_page_view: false });

    this.initialized = true;
  }

  /**
   * Sends a `page_view` event.  Call on every NavigationEnd.
   */
  trackPageView(url: string): void {
    if (!this.initialized) {
      return;
    }
    gtag('event', 'page_view', {
      page_path: url,
      page_location: this.#document.location.href,
    });
  }

  /**
   * Sends a custom event.  `name` must be a snake_case string (GA4 convention).
   * Keep it under 40 characters.
   */
  trackEvent(name: string, params: Record<string, unknown> = {}): void {
    if (!this.initialized) {
      return;
    }
    gtag('event', name, params);
  }
}
