import { IdentityLink } from "../interfaces";
import { EventJob, IdLinkJob } from "../jobqueue";
export declare const MAX_STORED_IDLINKS = 10;
export declare enum PersistKey {
    LastKvinit = "com.kochava.tracker.LastKvinit",
    EventQueue = "com.kochava.tracker.EventQueue",
    IdLinkQueue = "com.kochava.tracker.IdLinkQueue",
    DeviceId = "com.kochava.tracker.DeviceId",
    InstallId = "com.kochava.tracker.InstallId",
    FirstStartDate = "com.kochava.tracker.FirstStartDate",
    InstallSentDate = "com.kochava.tracker.InstallSentDate",
    KvinitSentDate = "com.kochava.tracker.KvinitSentDate",
    SessionCount = "com.kochava.tracker.SessionCount",
    IdentityLinks = "com.kochava.tracker.IdentityLinks",
    OverrideAppId = "com.kochava.tracker.OverrideAppId",
    OverrideDeviceId = "com.kochava.tracker.OverrideDeviceId",
    OldKvid = "kv_id"
}
export declare const checkInstallIdChange: (inputId: string, useCookies: boolean) => boolean;
export declare const addToPersistedEventQueue: (job: EventJob) => void;
export declare const removeFromEventPersistedQueue: (job: EventJob) => void;
export declare const updateOrAddPersistedIdLinkQueue: (job: IdLinkJob) => void;
export declare const removeFromIdLinkPersistedQueue: (job: IdLinkJob) => void;
export declare const addPersistedIdLinks: (key: string, value: string, useCookies: boolean) => void;
export declare const checkDuplicateIdLink: (key: string, value: string) => boolean;
export declare const getPersistedIdentityLinks: () => IdentityLink | undefined;
export declare const readAndUpdateUTM: (appGuid: string, useCookies: boolean) => string;
export declare const readAndUpdatePersistedValue: (key: PersistKey, useCookie: boolean) => string;
export declare const updatePersistedValue: (key: PersistKey, value: string, useCookie: boolean) => void;
export declare const deletePersistedValue: (item: PersistKey) => void;
export declare const deleteAllPersisted: () => void;
export declare const readAndUpdateDeviceId: (useCookie: boolean) => string;
export declare const readAndUpdateSessionCount: (useCookie: boolean) => number;
