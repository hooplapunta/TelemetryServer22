import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_VALUE_ACCESSOR } from '@angular/forms/src/directives/default_value_accessor';
import { getValueInRange } from '@ng-bootstrap/ng-bootstrap/util/util';

const url: string = 'http://localhost:3000';
const url2: string = 'https://suits-2021.herokuapp.com';

@Injectable()
export class EMUService {
    
    constructor(private http: HttpClient) { }


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
}