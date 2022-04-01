import { Unsubscribe } from './types';

export class Subject<Value> {
    private subscribers = new Set<(event: Value) => void>();

    subscribe(callback: (event: Value) => void): Unsubscribe {
        this.subscribers.add(callback);

        return () => this.subscribers.delete(callback);
    }

    emit(event: Value): void {
        this.subscribers.forEach(callback => callback(event));
    }
}
