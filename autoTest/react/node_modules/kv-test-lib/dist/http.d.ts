import { Payload } from "./payloads/payload";
export interface BaseResp {
    success: string | number | boolean;
}
export declare const sendRequest: (payload: Payload, endpoint: string) => Promise<string>;
export declare const wasRespSuccess: (success: string | number | boolean) => boolean;
