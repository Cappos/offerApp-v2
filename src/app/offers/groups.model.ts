import {Module} from "../modules/modules.model";
export class Group {
    constructor(public uid: number,
                public name: string,
                public bodytext: string,
                public subTotal: number,
                public tstamp: string,
                public cruserId: number,
                public crdate: string,
                public modules: Module[]) {
    }
}
