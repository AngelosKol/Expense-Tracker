import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  onSubmit() {
    const form = this.loginForm.value;
    this.authService.login(form.email, form.password).subscribe({
      next: (res) => {
        console.log('✅ Login success:', res);
        this.router.navigate(['/home']);
      },
      error: (err) => console.log(err),
    });
  }

  initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
}
