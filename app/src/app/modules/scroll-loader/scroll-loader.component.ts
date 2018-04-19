import {Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, Renderer} from '@angular/core';

@Directive({
    selector: '[scrollLoader]',
})
export class ScrollLoaderDirective implements OnChanges {

    @Input()
    listItems: Array<Object>;
    partialListItem: Array<Object> = [];
    @Output()
    updatePartialTable = new EventEmitter();
    private sum = 20;

    constructor(public el: ElementRef, public renderer: Renderer) {
    }

    ngOnChanges(changes) {
        const items = changes.listItems;
        if (items) {
            const currentValue = items.currentValue;
            if (currentValue) {
                this.listItems = items.currentValue;
                this.addItems(0, this.sum);
            }
        }
    }

    addItems(startIndex, endIndex) {
        if (this.listItems.length <= 0) {
            return;
        }
        if (endIndex > this.listItems.length) {
            endIndex = this.listItems.length; // Si on est à la dernière insertion
        }
        this.partialListItem = this.partialListItem.concat(this.listItems.slice(startIndex, endIndex));
        this.updatePartialTable.emit(this.partialListItem);
    }

    @HostListener('scroll') onScroll() {
        if (this.isScrolledIntoView()) {
            const start = this.sum;
            this.sum += 20;
            this.addItems(start, this.sum);
        }
    }

    isScrolledIntoView() {
        const elementTop = this.el.nativeElement.scrollTop;
        const elementScrollHeight = this.el.nativeElement.scrollHeight;
        const elementInitialHeight = this.el.nativeElement.clientHeight;
        return (elementTop + elementInitialHeight) / elementScrollHeight > 0.97;
    }
}
