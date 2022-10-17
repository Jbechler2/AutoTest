interface DefaultConfig {
    readonly general: {
        readonly app_id_override: string;
        readonly device_id_override: string;
    };
    readonly config: {
        readonly init_token: string;
        readonly refresh_minimum: number;
    };
    readonly install: {
        readonly resend_id: "";
        readonly updates_enabled: true;
    };
    readonly networking: {
        readonly urls: {
            readonly init: "https://kvinit-prod.api.kochava.com/track/kvinit";
            readonly install: "https://web-sdk.control.kochava.com/track/json/";
            readonly event: "https://web-sdk.control.kochava.com/track/json/";
            readonly identityLink: "https://web-sdk.control.kochava.com/track/json/";
        };
        readonly retry_waterfall: [7, 30, 300, 1800];
    };
    readonly privacy: {
        readonly allow_custom_ids: string[];
        readonly deny_datapoints: string[];
        readonly deny_event_names: string[];
        readonly deny_identity_links: string[];
    };
}
export declare const DEFAULTS: DefaultConfig;
export interface KvConfig {
    general: {
        device_id_override?: string;
        app_id_override?: string;
    };
    config: {
        init_token: string;
        refresh_minimum: number;
    };
    install: {
        resend_id?: string;
        updates_enabled: boolean;
    };
    networking: {
        urls: {
            init: string;
            install: string;
            identityLink: string;
            event: string;
        };
        retry_waterfall: number[];
    };
    privacy: {
        allow_custom_ids: string[];
        deny_datapoints: string[];
        deny_event_names: string[];
        deny_identity_links: string[];
    };
}
export interface KvinitResponse {
    general?: {
        device_id_override?: string;
        app_id_override?: string;
    };
    config?: {
        init_token?: string;
        refresh_minimum?: number;
    };
    install?: {
        resend_id?: string;
        updates_enabled?: boolean;
    };
    networking?: {
        urls?: {
            init?: string;
            install?: string;
            identityLink?: string;
            event?: string;
        };
        retry_waterfall?: number[];
    };
    privacy?: {
        allow_custom_ids?: string[];
        deny_datapoints?: string[];
        deny_event_names?: string[];
        deny_identity_links?: string[];
    };
    success?: string | number | boolean;
}
export declare type Json = {
    [key: string]: any;
};
export declare type IdentityLink = {
    [key: string]: string;
};
export interface Urls {
    init: string;
    install: string;
    event: string;
    identityLink: string;
}
export interface OverrideUrls {
    init?: string;
    install?: string;
    event?: string;
    identityLink?: string;
}
export interface CustomValue {
    data: Json;
    isDeviceId: boolean;
}
export interface WrapperVersion {
    name: string;
    version: string;
    build_date: string;
}
export {};
