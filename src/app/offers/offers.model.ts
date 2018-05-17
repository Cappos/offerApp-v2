import {Group} from "./groups.model";
import {OfferDescription} from "./offersDescription.model";

export class Offer {
    constructor(public uid: number,
                public offerTitle: string,
                public offerNumber: string,
                public bodytext: string,
                public totalPrice: number,
                public tstamp: string,
                public crdate: string,
                public clientName :string,
                public clientUid: number,
                public offerDescription: OfferDescription,
                public groups: Group[]) {
    }
}
