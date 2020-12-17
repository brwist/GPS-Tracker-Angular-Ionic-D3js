import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class OfflineInterceptor implements HttpInterceptor {

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // check to see if there's internet
        if (!window.navigator.onLine) {
            // if there is no internet, throw a HttpErrorResponse error
            // since an error is thrown, the function will terminate here
            return Observable.throw(new HttpErrorResponse({error: 'Internet is required.'}));
        } else {
            // else return the normal request
            return next.handle(request);
        }
    }
}
