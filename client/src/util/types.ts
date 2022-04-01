export type Unsubscribe = () => void;

export type DistributiveOmit<T, K extends keyof any> = T extends any
    ? Omit<T, K>
    : never;
