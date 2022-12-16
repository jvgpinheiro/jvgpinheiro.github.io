export function makeAnimationThrotler(): (fnCallback: () => void) => () => void {
    const sRenderCallbacks: Set<() => void> = new Set();
    let nAnimationRequestID = -1;

    return (fnCallback: () => void) => {
        sRenderCallbacks.add(fnCallback);
        const execAndRemoveListener = () => {
            fnCallback();
            sRenderCallbacks.delete(fnCallback);
        };

        if (nAnimationRequestID !== -1) {
            return execAndRemoveListener;
        }
        nAnimationRequestID = requestAnimationFrame(() => {
            sRenderCallbacks.forEach((fnStoredCallback) => fnStoredCallback());
            sRenderCallbacks.clear();
            nAnimationRequestID = -1;
        });
        return execAndRemoveListener;
    };
}
