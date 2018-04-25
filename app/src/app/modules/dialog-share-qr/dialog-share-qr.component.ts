import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-share-qr',
  templateUrl: './dialog-share-qr.component.html',
  styleUrls: ['./dialog-share-qr.component.scss']
})
export class DialogShareQrComponent implements OnInit {
  qrValue;
  elementType: 'url' | 'canvas' | 'img' = 'url';

  constructor() { }

  ngOnInit() {
      var chemin = document.location.href;
      this.qrValue = chemin;
      (<HTMLScriptElement[]><any>document.getElementsByTagName('img'))[0].style.width = "100%";
      (<HTMLScriptElement[]><any>document.getElementsByTagName('img'))[0].style.height = "100%";

  }

}
