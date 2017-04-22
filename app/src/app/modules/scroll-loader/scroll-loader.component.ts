import {Directive, ElementRef, HostListener, Input, OnInit, Renderer} from '@angular/core';

@Directive({
    selector: '[scrollLoader]',
})
export class ScrollLoader implements OnInit {

    constructor(public el: ElementRef, public renderer: Renderer) {
    }

    @Input() listItems: Array<any>;
    @Input() partialListItem: Array<Object> = new Array();
    private sum: number = 20;


    ngOnInit() {
        this.addItems(0, this.sum);
    }

    // ngOnChanges(changes) {
    //     const items = changes.listItems;
    //     if (items) {
    //         const currentValue = items.currentValue;
    //         if (currentValue) {
    //             this.listItems = items.currentValue;
    //         }
    //     }
    // }

    addItems(startIndex, endIndex) {
        if (this.listItems.length) {
            console.log("VIDEE");
            return;
        }
        if (endIndex > this.listItems.length)
            endIndex = this.listItems.length; //Si on est à la dernière insertion
        this.partialListItem = this.partialListItem.concat(this.listItems.slice(startIndex, endIndex))
    }

    @HostListener('scroll') onScroll() {
        console.log("Scrolll");
        if (this.isScrolledIntoView()) {
            const start = this.sum;
            this.sum += 20;
            this.addItems(start, this.sum);
        }
    }

    isScrolledIntoView() {
        let elementTop = this.el.nativeElement.scrollTop;
        let elementScrollHeight = this.el.nativeElement.scrollHeight;
        let elementInitialHeight = this.el.nativeElement.clientHeight;
        return (elementTop + elementInitialHeight) / elementScrollHeight > 0.97;
    }

}
