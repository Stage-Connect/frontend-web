import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  role: 'entreprise' | 'admin';
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public user$ = this.userSubject.asObservable();

  constructor(private router: Router) {}

  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      token: 'fake-jwt-token',
      user: {
        id: 1,
        email: email,
        role: email.includes('admin') ? 'admin' : 'entreprise',
        name: email.includes('admin') ? 'Administrateur' : 'Entreprise Partner'
      }
    };

    return of(mockResponse).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): 'entreprise' | 'admin' | null {
    return this.userSubject.value?.role || null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    if (userRole === 'admin') return true; 
    return userRole === role;
  }
}
