import { RefObject } from 'react';
import type { Placement, Middleware, ComputePositionReturn, SideObject } from '@floating-ui/core';
export { autoPlacement, flip, hide, limitShift, offset, shift, size, inline, detectOverflow, } from '@floating-ui/core';
declare type UseFloatingReturn = Data & {
    update: () => void;
    offsetParent: (node: any) => void;
    floating: (node: any) => void;
    reference: (node: any) => void;
    refs: {
        reference: RefObject<any>;
        floating: RefObject<any>;
        offsetParent: RefObject<any>;
    };
    scrollProps: {
        onScroll: (event: {
            nativeEvent: {
                contentOffset: {
                    x: number;
                    y: number;
                };
            };
        }) => void;
        scrollEventThrottle: 16;
    };
};
declare type Data = Omit<ComputePositionReturn, 'x' | 'y'> & {
    x: number | null;
    y: number | null;
};
export declare const useFloating: ({ placement, middleware, sameScrollView, }?: {
    placement?: "top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end" | undefined;
    middleware?: Middleware[] | undefined;
    sameScrollView?: boolean | undefined;
}) => UseFloatingReturn;
export declare const arrow: (options: {
    element: any;
    padding?: number | SideObject;
}) => Middleware;
