const createObserver = () => {
    const _listeners = new Set();
    const subscribe = (observer) => {
        _listeners.add(observer);
        return {
            unsubscribe() {
                _listeners.delete(observer);
            },
        };
    };
    const destroy = () => _listeners.clear();
    const notify = (newState, prevState) => {
        for (const listener of _listeners) {
            listener(newState, prevState);
        }
    };
    return {
        get getListeners() {
            return Array.from(_listeners);
        },
        notify,
        destroy,
        subscribe,
    };
};
export { createObserver };
