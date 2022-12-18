import ScrollTransitions, { ScrollTransitionOptions } from './ScrollTransitions';

type ScrollDirection = 'top' | 'left' | 'bottom' | 'right';
type SmoothScrollParams = {
    element: HTMLElement | Window;
    duration: number;
    direction: ScrollDirection;
    cubicBezierPoints?: CubicBezierPoints;
    transition?: ScrollTransitionOptions;
    ammountToScroll?: number;
    onRefUpdateCallback?: (amountScrolled: number) => void;
    onAnimationCompleteCallback?: () => void;
};
type CubicBezierPoints = { x1: number; y1: number; x2: number; y2: number };
type ScrollProgressParams = {
    transition?: ScrollTransitionOptions;
    cubicBezierPoints?: CubicBezierPoints;
    duration: number;
    runTime: number;
};
type ScrollCubicBezierParams = { percentTimeElapsed: number; x1: number; y1: number; x2: number; y2: number };

export function smoothScroll(scrollParams: SmoothScrollParams) {
    const {
        direction,
        duration,
        onAnimationCompleteCallback,
        onRefUpdateCallback,
        ammountToScroll,
        transition,
        cubicBezierPoints,
    } = scrollParams;
    const scrollDirectionFactor = direction === 'bottom' || direction === 'right' ? 1 : -1;
    const elementToScroll = scrollParams.element;
    const { remainingScroll, initialScrollPosition } = getTotalScroll(elementToScroll, direction, ammountToScroll);
    let totalScroll = remainingScroll;

    let startTime = Date.now();
    let lastTickScroll = 0;

    const scrollOnNextTick = (timestamp: number) => {
        const runTime = timestamp - startTime;
        const progress = getProgress({ transition, cubicBezierPoints, duration, runTime });
        const scrollAmt = progress * totalScroll;
        const scrollToForThisTick = scrollAmt + initialScrollPosition;
        const scrollDiff = (scrollToForThisTick - lastTickScroll) * scrollDirectionFactor;

        if (runTime < duration) {
            if (elementToScroll instanceof Window) {
                const scrollDiffX = direction === 'left' || direction === 'right' ? scrollDiff : 0;
                const scrollDiffY = direction === 'left' || direction === 'right' ? 0 : scrollDiff;
                elementToScroll.scrollTo(elementToScroll.scrollX + scrollDiffX, elementToScroll.scrollY + scrollDiffY);
            } else {
                console.log(scrollDiff);
                const propToChange = direction === 'left' || direction === 'right' ? 'scrollLeft' : 'scrollTop';
                elementToScroll[propToChange] += scrollDiff;
            }

            onRefUpdateCallback && onRefUpdateCallback(scrollDiff);
            requestAnimationFrame(scrollOnNextTick);
        } else if (onAnimationCompleteCallback) {
            onAnimationCompleteCallback();
        }
    };

    requestAnimationFrame((timestamp) => {
        startTime = timestamp;
        scrollOnNextTick(timestamp);
    });
}

function getTotalScroll(elementToScroll: HTMLElement | Window, direction: ScrollDirection, ammountToScroll?: number) {
    let scrollDirectionProp: 'scrollX' | 'scrollLeft' | 'scrollY' | 'scrollTop' = 'scrollLeft';
    let elementWidthProp: 'innerWidth' | 'clientWidth' | 'innerHeight' | 'clientHeight' = 'clientWidth';
    let initialScrollPosition: number = 0;
    let scrollLengthProp: 'scrollWidth' | 'scrollHeight' = 'scrollWidth';
    let totalScroll: number;
    if (elementToScroll instanceof Window) {
        scrollDirectionProp = direction === 'left' || direction === 'right' ? 'scrollX' : 'scrollY';
        elementWidthProp = direction === 'left' || direction === 'right' ? 'innerWidth' : 'innerHeight';
        initialScrollPosition = elementToScroll[scrollDirectionProp];
        const documentElement = document.documentElement;
        totalScroll = ammountToScroll ?? documentElement.offsetWidth;
    } else {
        scrollDirectionProp = direction === 'left' || direction === 'right' ? 'scrollLeft' : 'scrollTop';
        elementWidthProp = direction === 'left' || direction === 'right' ? 'clientWidth' : 'clientHeight';
        initialScrollPosition = elementToScroll[scrollDirectionProp];
        totalScroll = ammountToScroll ?? elementToScroll[scrollLengthProp] - elementToScroll[elementWidthProp];
    }
    return { remainingScroll: totalScroll - initialScrollPosition, initialScrollPosition };
}

function getProgress({ transition, cubicBezierPoints, duration, runTime }: ScrollProgressParams) {
    const scrollTransitions = new ScrollTransitions();
    const percentTimeElapsed = runTime / duration;
    const scrollCallback = transition ? scrollTransitions[transition] : null;

    if (scrollCallback) {
        return scrollCallback(percentTimeElapsed);
    } else if (
        cubicBezierPoints &&
        !isNaN(cubicBezierPoints.x1) &&
        !isNaN(cubicBezierPoints.y1) &&
        !isNaN(cubicBezierPoints.x2) &&
        !isNaN(cubicBezierPoints.y2) &&
        cubicBezierPoints.x1 >= 0 &&
        cubicBezierPoints.x2 >= 0
    ) {
        return getCubicBezierScrollTo({
            percentTimeElapsed,
            ...cubicBezierPoints,
        });
    } else {
        console.error('Please enter a valid easing value');
    }
    return 0;
}

// the cubic bezier function
function getCubicBezierScrollTo({ percentTimeElapsed, x1, y1, x2, y2 }: ScrollCubicBezierParams): number {
    const B1 = (t: number) => Math.pow(t, 3);
    const B2 = (t: number) => 3 * t * t * (1 - t);
    const B3 = (t: number) => 3 * t * Math.pow(1 - t, 2);
    const B4 = (t: number) => Math.pow(1 - t, 3);
    return (
        1 -
        (x1 * B1(percentTimeElapsed) + y1 * B2(percentTimeElapsed) + x2 * B3(percentTimeElapsed) + y2 * B4(percentTimeElapsed))
    );
}
