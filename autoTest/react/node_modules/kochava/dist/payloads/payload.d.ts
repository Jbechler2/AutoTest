import { Json } from '../interfaces';
import { KochavaInstance } from "../kochava";
export interface Payload {
    action: string;
    kochava_app_id: string;
    kochava_device_id: string;
    sdk_version: string;
    sdk_protocol: string;
    nt_id: string;
    build_date?: string;
    init_token?: string;
    data?: Json;
}
export interface PreStartBody {
    action: string;
    sdk_version: string;
    sdk_protocol: string;
    init_token?: string;
    data?: Json;
}
export interface PostStartBody {
    kochava_app_id: string;
    kochava_device_id: string;
    nt_id: string;
    data?: Json;
}
export interface CommonData {
    starttime: number;
    uptime: number;
    usertime: number;
}
export declare const constructPayload: (action: string, instance: KochavaInstance, originalNtId?: string) => Payload;
export declare const constructCommonData: (instance: KochavaInstance) => CommonData;
