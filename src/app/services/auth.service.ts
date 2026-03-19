import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  role: 'entreprise' | 'admin';
  name?: string;
  avatar?: string;
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
    let role: 'entreprise' | 'admin' = 'entreprise';
    let name = 'Entreprise Partner';
    let avatar = 'assets/images/avatars/company-logo.png';

    if (email === 'admin@stageconnect.cm' && password === 'admin123') {
      role = 'admin';
      name = 'Administrateur Principal';
      avatar = 'assets/logo.jpeg';
    } else if (email === 'entreprise@stageconnect.cm' && password === 'entreprise123') {
      role = 'entreprise';
      name = 'Entreprise InnovAfrica';
      avatar = 'assets/images/avatars/company-logo.png';
    } else {
      // Fallback for generic login if needed, or error. 
      // For this task, we follow the user credentials.
      if (email.includes('admin')) {
        role = 'admin';
        name = 'Administrateur Demo';
        avatar = 'assets/logo.jpeg';
      }
    }

    const mockResponse: AuthResponse = {
      token: `fake-jwt-token-${role}`,
      user: {
        id: role === 'admin' ? 1 : 2,
        email: email,
        role: role,
        name: name,
        avatar: avatar
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
