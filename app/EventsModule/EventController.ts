type EventCallback<EventList, T extends keyof EventList> = (data: EventList[T]) => void;

export default class EventController<EventList> {
    private events: Map<keyof EventList, Set<EventCallback<EventList, any>>>;
    private records: Map<keyof EventList, EventList[keyof EventList]>;

    constructor() {
        this.events = new Map();
        this.records = new Map();
    }

    public addListener<T extends keyof EventList>(event: T, callback: EventCallback<EventList, T>): () => void {
        const sNotifiers = this.events.get(event) || new Set();
        sNotifiers.add(callback);
        this.events.set(event, sNotifiers);
        return () => this.removeListener(event, callback);
    }

    public listenNow<T extends keyof EventList>(event: T, callback: EventCallback<EventList, T>): () => void {
        const data = this.records.get(event) as EventList[T] | undefined;
        if (data) {
            callback(data);
        }
        return this.addListener(event, callback);
    }

    public emitAndRecord<T extends keyof EventList>(event: T, data: EventList[T]): void {
        this.records.set(event, data);
        this.emit(event, data);
    }

    public removeListener<T extends keyof EventList>(event: T, callback: EventCallback<EventList, T>): boolean {
        const sNotifiers = this.events.get(event);
        if (sNotifiers) {
            sNotifiers.delete(callback);
            return true;
        }
        return false;
    }

    public listenOnce<T extends keyof EventList>(event: T, callback: EventCallback<EventList, T>): () => void {
        const fnRemove = this.addListener(event, (data) => {
            callback(data);
            fnRemove();
        });
        return fnRemove;
    }

    public when<T extends keyof EventList>(event: T, timeout?: number): Promise<EventList[T]> {
        return new Promise((fnResolve, fnReject) => {
            const remove = this.listenOnce(event, fnResolve);
            if (!timeout) {
                return;
            }
            setTimeout(() => {
                remove();
                fnReject(Error('Timeout Error'));
            }, timeout);
        });
    }

    public async whenOrIf<T extends keyof EventList>(event: T, timeout?: number) {
        return this.records.has(event) ? this.records.get(event) : this.when(event, timeout);
    }

    public emit<T extends keyof EventList>(event: T, data: EventList[T]): void {
        const sNotifiers = this.events.get(event);
        if (!sNotifiers) {
            return;
        }
        sNotifiers.forEach((fnCallBack) => fnCallBack(data));
    }
}
