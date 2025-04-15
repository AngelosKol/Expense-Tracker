import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(formData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }) {
    return this.http.post(`${this.apiUrl}/auth/register`, formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  login(email: string, password: string) {
    return this.http
      .post(`${this.apiUrl}/auth/authenticate`, { email, password })
      .pipe(
        map((response: any) => {
          const token = response.access_token;
          localStorage.setItem('jwtToken', token);
          return response;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['landing-page/login'], { replaceUrl: true });
  }

  public get loggedIn(): boolean {
    return localStorage.getItem('jwtToken') !== null;
  }
}
