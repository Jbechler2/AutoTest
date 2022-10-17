import { Json, Urls, CustomValue, KvConfig } from "./interfaces";
declare global {
    interface Window {
        kochava: Kochava;
    }
}
export interface KochavaInstance {
    appGuid: string;
    started: boolean;
    installStarted: boolean;
    kvinitDone: boolean;
    installDone: boolean;
    disableAutoPage: boolean;
    useCookies: boolean;
    sleep: boolean;
    version: string;
    buildDate: string;
    overrideUrls: Urls;
    customValues: CustomValue[];
    kochavaSession: string;
    retryWaterfall: number[];
    startTimeMS: number;
    utm: string;
    kochavaDeviceId: string;
    kochavaInstallId: string;
    kochavaInstallDate: number;
    kochavaSessionCount: number;
    kochavaConfig?: KvConfig;
}
export declare class Kochava {
    #private;
    private constructor();
    static create(): Kochava;
    static createForNode(): Kochava;
    static createForReact(): Kochava;
    static createForVue(): Kochava;
    static createForAngular(): Kochava;
    useCookies(condition?: boolean): void;
    disableAutoPage(condition?: boolean): void;
    startWithAppGuid(appGuid: string): void;
    shutdown(deleteData: boolean): void;
    setLogLevel(logLevel: string): void;
    executeAdvancedInstruction(key: string, valueStr: string, callback?: (input: string) => void): void;
    sendEvent(name: string, data?: Json | string): void;
    sendPageEvent(pageName?: string, additionalData?: Json): void;
    registerIdentityLink(name: string, identifier: string): void;
    registerCustomValue(name: string, value: string): void;
    registerCustomDeviceIdentifier(name: string, value: string): void;
    getStarted(): boolean;
    getDeviceId(): string;
    setSleep(sleep: boolean): void;
}
