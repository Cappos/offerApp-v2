import {Offer} from "../offers/offers.model";

export class Client {
    constructor(public uid: number,
                public contactPerson: string,
                public companyName: string,
                public address: string,
                public contactPhone: number,
                public mobile: number,
                public mail: string,
                public webSite: string,
                public pib: string,
                public tstamp: string,
                public cruserId: number,
                public crdate: string,
                public offers: Offer[]) {
    }
}
