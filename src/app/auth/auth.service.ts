import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AuthService {
    token: string;

    constructor(private router: Router, private http: HttpClient) {}

    login(user) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post('/user/login', body, {headers: headers})
            .map((response: Response) => response)
            .catch((error: Response) => Observable.throw(error));
    }

    logout() {
        localStorage.clear();
        this.router.navigateByUrl('/login');
    }

    isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    isAdmin() {
        return localStorage.getItem('admin') !== 'false';
    }
}
