import { KochavaInstance } from "../kochava";
import { KvinitResponse } from "../interfaces";
export declare const cancelRetries: () => void;
export declare const send: (instance: KochavaInstance, retryWaterfall: number[], retries?: number) => Promise<boolean>;
export declare const applyKvinitResp: (instance: KochavaInstance, resp: KvinitResponse) => void;
