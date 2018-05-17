import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Offer} from "../offers/offers.model";
import {Group} from "../offers/groups.model";

@Injectable()
export class DataService {

    constructor(private httpClient: HttpClient){}

    getPagesData(){
        return this.httpClient.get<any>('http://wrenchweb.com/http/pagesData.json', {
            observe: 'body',
            responseType: 'json'
        });
    }

    getPageData(){
        return this.httpClient.get<any>('http://wrenchweb.com/http/pageData.json', {
            observe: 'body',
            responseType: 'json'
        });
    }

    getOfferData(){
        return this.httpClient.get<Offer>('http://wrenchweb.com/http/offerData.json', {
            observe: 'body',
            responseType: 'json'
        });
    }

    getChapterData(){
        return this.httpClient.get<Group>('http://wrenchweb.com/http/chapterData.json', {
            observe: 'body',
            responseType: 'json'
        });
    }

}
