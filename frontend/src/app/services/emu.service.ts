import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_VALUE_ACCESSOR } from '@angular/forms/src/directives/default_value_accessor';
import { getValueInRange } from '@ng-bootstrap/ng-bootstrap/util/util';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

const url: string = 'http://localhost:3000';
const url2: string = 'https://suits-2021.herokuapp.com';

@Injectable()
export class EMUService {
    
    constructor(private http: HttpClient, private socket: Socket) { }


    getEMU() {
        return this
                .http
                .get(url+'/api/simulation/state'); 
            }

    getUia() {
        return this
        .http
        .get(url+'/api/simulation/uiastate'); 
    }

    // Socket Commands
    sRegister(name, room) {
        this.socket.emit('register', {name, room});
    }

    sGetRegister(): Observable<any> {
        console.log('Getting something');
        return this.socket.fromEvent('register').pipe(map((data) => data));
    }

    sDisconnect() {
        this.socket.disconnect();
    }

    sConnect() {
        this.socket.connect();
    }

    sEnableUiaSim(room) {
        this.socket.emit('uiasim', { room });
    }

    sUiaSimEnabled(): Observable<any> {
        return this.socket.fromEvent('uiasim').pipe(map((data) => data));
    }

    sUIAToggle(event) {
        this.socket.emit('uiatoggle', { event });
    }

    sUIAGetData(): Observable<any> {
        return this.socket.fromEvent('uiacontrols').pipe(map((data) => data));
    }
}