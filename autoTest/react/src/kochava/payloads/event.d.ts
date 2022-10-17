import { Json } from "../interfaces";
import { KochavaInstance } from "../kochava";
import { PreStartBody, PostStartBody } from "./payload";
export declare const constructPreStart: (instance: KochavaInstance, eventName: string, eventData?: Json | string) => PreStartBody;
export declare const constructPostStart: (instance: KochavaInstance, preStartBody: PreStartBody) => PostStartBody;
export declare const send: (instance: KochavaInstance, preStartBody: PreStartBody, postStartBody: PostStartBody) => Promise<boolean>;
