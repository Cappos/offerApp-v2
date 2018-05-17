export class Module {
    constructor(public uid: number,
                public name: string,
                public bodytext: string,
                public price: number,
                public tstamp: string,
                public cruserId: number,
                public crdate: string,
                public modify: boolean,
                public groupUid: number,
                public categoryId: number,
                public groupName: string) {
    }
}
