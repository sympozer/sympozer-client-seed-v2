import { Component } from '@angular/core';

@Component({
    selector: 'app-qrcode',
    templateUrl: 'qrcode.component.html'
})
export class QrcodeComponent {
    elementType : 'url' | 'canvas' | 'img' = 'url';
    value : string = 'Techiediaries';
}