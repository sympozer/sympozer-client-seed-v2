import {trigger, state, animate, style, transition} from '@angular/core';

export function routerTransition() {
    return slideToTop();
}

function slideToRight() {
    return trigger('routerTransition', [
        state('void', style({position: 'fixed', width: '100%'})),
        state('*', style({position: 'fixed', width: '100%'})),
        transition(':enter', [
            style({transform: 'translateX(-100%)'}),
            animate('0.5s ease-in-out', style({transform: 'translateX(0%)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateX(0%)'}),
            animate('0.5s ease-in-out', style({transform: 'translateX(100%)'}))
        ])
    ]);
}

function slideToLeft() {
    return trigger('routerTransition', [
        state('void', style({position: 'fixed', width: '100%'})),
        state('*', style({position: 'fixed', width: '100%'})),
        transition(':enter', [
            style({transform: 'translateX(100%)'}),
            animate('0.5s ease-in-out', style({transform: 'translateX(0%)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateX(0%)'}),
            animate('0.5s ease-in-out', style({transform: 'translateX(-100%)'}))
        ])
    ]);
}

function slideToBottom() {
    return trigger('routerTransition', [
        state('void', style({position: 'absolute', top: '0', right: '0', left: '0'})),
        state('*', style({position: 'absolute', top: '0', right: '0', left: '0'})),
        transition(':enter', [
            style({transform: 'translateY(-100%)'}),
            animate('0.5s ease-in-out', style({transform: 'translateY(0%)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateY(0%)'}),
            animate('0.5s ease-in-out', style({transform: 'translateY(100%)'}))
        ])
    ]);
}

function slideToTop() {
    return trigger('routerTransition', [
        state('void', style({
            position: 'absolute',
            width: '100%',
            padding: '10px',
            display: 'block',
            willChange: 'transform, position'
        })),
        state('*', style({
            position: 'relative',
            padding: '10px',
            display: 'block'
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