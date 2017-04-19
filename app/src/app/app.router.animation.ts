import {trigger, state, animate, style, transition} from '@angular/core';

export function routerTransition() {
    return slideToTop();
}

function slideToTop() {
    return trigger('routerTransition', [
        state('void', style({
            position: 'absolute',
            width: 'calc(100% - 20px)',
            willChange: 'transform, position',
            overflow: 'hidden'
        })),
        state('*', style({
            position: 'relative',
            overflow: 'hidden'
        })),
        transition(':enter', [
            style({transform: 'translate3D(0, 10%, 0)', opacity: '0'}),
            animate('.4s cubic-bezier(.25, .8, .25, 1)', style({transform: 'translate3D(0, 0, 0)', opacity: '1'}))
        ]),
        transition(':leave', [
            style({transform: 'translate3D(0, 0, 0)'}),
            animate('0s cubic-bezier(.55, 0, .55, .2)', style({opacity: '0', transform: 'translate3D(0, -100%, 0)'}))
        ])
    ]);
}