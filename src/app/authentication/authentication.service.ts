import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterRequest,
} from '../shared/dto';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(formData: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/auth/register`, formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  login(email: string, password: string) {
    const authRequest: AuthenticationRequest = { email, password };
    return this.http
      .post<AuthenticationResponse>(
        `${this.apiUrl}/auth/authenticate`,
        authRequest
      )
      .pipe(
        map((response: AuthenticationResponse) => {
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
