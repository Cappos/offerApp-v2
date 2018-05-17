import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'stringReplace'})

export class StringReplace implements PipeTransform {
    transform(value: string): string {

        let newValue = value.replace(/^.{4}/g, '').replace(/\\/g,"/");
        return `${newValue}`;
    }
}
