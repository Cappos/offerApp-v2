import {Offer} from '../offers/offers.model';

export class Sealer {
    constructor(public id: string,
                public name: string,
                public email: string,
                public phone: string,
                public mobile: string,
                public value: number,
                public active: Offer) {
    }
}
