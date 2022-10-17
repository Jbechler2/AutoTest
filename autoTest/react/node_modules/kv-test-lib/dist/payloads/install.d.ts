import { KochavaInstance } from "../kochava";
import { Payload } from "./payload";
export declare const build: (instance: KochavaInstance) => Payload;
export declare const cancelRetries: () => void;
export declare const send: (instance: KochavaInstance, payload: Payload, retries?: number) => Promise<boolean>;
export declare const onSuccess: (instance: KochavaInstance) => void;
