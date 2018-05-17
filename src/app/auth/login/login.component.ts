import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {User} from "../user.model";
import {Router} from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    errorMessage = null;

    constructor(private authService: AuthService, private router: Router) {
    }

    ngOnInit() {
    }

    onLogin(form: NgForm) {
        const username = form.value.username;
        const password = form.value.password;
        const user = new User(username, password);
        this.authService.login(user).subscribe(
            data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('admin', data.admin);
                localStorage.setItem('created', data.created);
                this.router.navigateByUrl('/');
            },
            error => {
                console.log(error);
                this.errorMessage = error.error.error.message;
            }
        );
    }
}
