/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as utils from "../utils/utils";
import { getUrlParameter } from "./browser";
import { setCookie, getCookie, deleteCookie } from "./cookies";
import { Log } from "../utils/log";
export const MAX_STORED_IDLINKS = 10;
export var PersistKey;
(function (PersistKey) {
    PersistKey["LastKvinit"] = "com.kochava.tracker.LastKvinit";
    PersistKey["EventQueue"] = "com.kochava.tracker.EventQueue";
    PersistKey["IdLinkQueue"] = "com.kochava.tracker.IdLinkQueue";
    PersistKey["DeviceId"] = "com.kochava.tracker.DeviceId";
    PersistKey["InstallId"] = "com.kochava.tracker.InstallId";
    PersistKey["FirstStartDate"] = "com.kochava.tracker.FirstStartDate";
    PersistKey["InstallSentDate"] = "com.kochava.tracker.InstallSentDate";
    PersistKey["KvinitSentDate"] = "com.kochava.tracker.KvinitSentDate";
    PersistKey["SessionCount"] = "com.kochava.tracker.SessionCount";
    PersistKey["IdentityLinks"] = "com.kochava.tracker.IdentityLinks";
    PersistKey["OverrideAppId"] = "com.kochava.tracker.OverrideAppId";
    PersistKey["OverrideDeviceId"] = "com.kochava.tracker.OverrideDeviceId";
    PersistKey["OldKvid"] = "kv_id";
})(PersistKey || (PersistKey = {}));
const storedKeys = [
    PersistKey.LastKvinit,
    PersistKey.EventQueue,
    PersistKey.IdLinkQueue,
    PersistKey.DeviceId,
    PersistKey.InstallId,
    PersistKey.FirstStartDate,
    PersistKey.InstallSentDate,
    PersistKey.KvinitSentDate,
    PersistKey.SessionCount,
    PersistKey.IdentityLinks,
    PersistKey.OverrideAppId,
    PersistKey.OverrideDeviceId,
];
export const checkInstallIdChange = (inputId, useCookies) => {
    const persistedInstallId = readAndUpdatePersistedValue(PersistKey.InstallId, useCookies);
    // if the input is empty, we don't need to change
    if (!inputId)
        return false;
    // if the persistedId is empty, we will need to change
    if (!persistedInstallId) {
        updatePersistedValue(PersistKey.InstallId, inputId, useCookies);
        return true;
    }
    // if the inputId and persistedId are the same, we dont need to change
    if (inputId === persistedInstallId)
        return false;
    // at this point both inputId and persistedInstallId exist and are not equal,
    // so we must need to change
    updatePersistedValue(PersistKey.InstallId, inputId, useCookies);
    return true;
};
export const addToPersistedEventQueue = (job) => {
    const persistedQueueStr = localStorage.getItem(PersistKey.EventQueue);
    const persistedQueue = JSON.parse(persistedQueueStr) || [];
    persistedQueue.push(job);
    localStorage.setItem(PersistKey.EventQueue, JSON.stringify(persistedQueue));
};
export const removeFromEventPersistedQueue = (job) => {
    const persistedQueueStr = localStorage.getItem(PersistKey.EventQueue);
    const persistedQueue = JSON.parse(persistedQueueStr) || [];
    const queueWithJobRemoved = persistedQueue.filter(persistedJob => {
        return persistedJob.id !== job.id;
    });
    localStorage.setItem(PersistKey.EventQueue, JSON.stringify(queueWithJobRemoved));
};
export const updateOrAddPersistedIdLinkQueue = (job) => {
    const idLinkKey = Object.keys(job.idLink)[0];
    const persistedQueueStr = localStorage.getItem(PersistKey.IdLinkQueue);
    const persistedQueue = JSON.parse(persistedQueueStr) || [];
    let updated = false;
    for (const persistedJob of persistedQueue) {
        const persistedKey = Object.keys(persistedJob.idLink)[0];
        // if the key is already there, update it
        if (idLinkKey === persistedKey) {
            persistedJob.idLink[idLinkKey] = job.idLink[idLinkKey];
            updated = true;
        }
    }
    // if the key is new, add it
    if (!updated)
        persistedQueue.push(job);
    localStorage.setItem(PersistKey.IdLinkQueue, JSON.stringify(persistedQueue));
};
export const removeFromIdLinkPersistedQueue = (job) => {
    const persistedQueueStr = localStorage.getItem(PersistKey.IdLinkQueue);
    const persistedQueue = JSON.parse(persistedQueueStr) || [];
    const queueWithJobRemoved = persistedQueue.filter(persistedJob => {
        return persistedJob.id !== job.id;
    });
    localStorage.setItem(PersistKey.IdLinkQueue, JSON.stringify(queueWithJobRemoved));
};
export const addPersistedIdLinks = (key, value, useCookies) => {
    const persistedIdLinksStr = localStorage.getItem(PersistKey.IdentityLinks);
    const persistedIdLinks = JSON.parse(persistedIdLinksStr) || {};
    const storedSoFar = Object.keys(persistedIdLinks);
    if (storedSoFar.length > MAX_STORED_IDLINKS) {
        Log.debug("Maximum stored idLinks reached, most recent idLink will not be stored.");
        return;
    }
    persistedIdLinks[key] = value;
    updatePersistedValue(PersistKey.IdentityLinks, JSON.stringify(persistedIdLinks), useCookies);
};
export const checkDuplicateIdLink = (key, value) => {
    const persistedIdLinksStr = localStorage.getItem(PersistKey.IdentityLinks);
    if (persistedIdLinksStr) {
        const persistedIdLinks = JSON.parse(persistedIdLinksStr) || {};
        for (const persistedKey in persistedIdLinks) {
            if (key === persistedKey && persistedIdLinks[persistedKey] === value) {
                return true;
            }
        }
    }
    return false;
};
export const getPersistedIdentityLinks = () => {
    const persistedIdLinksStr = localStorage.getItem(PersistKey.IdentityLinks);
    if (persistedIdLinksStr) {
        return JSON.parse(persistedIdLinksStr);
    }
    return undefined;
};
export const readAndUpdateUTM = (appGuid, useCookies) => {
    const storageName = appGuid + "_click";
    const urlValue = getUrlParameter("ko_click_id");
    const storageValue = localStorage.getItem(storageName);
    let cookieValue = "";
    if (useCookies)
        cookieValue = getCookie(storageName);
    if (urlValue) {
        localStorage.setItem(storageName, urlValue);
        if (useCookies)
            setCookie(storageName, urlValue);
    }
    else if (storageValue) {
        if (useCookies)
            setCookie(storageName, urlValue);
    }
    return (urlValue) ? urlValue :
        (storageValue) ? storageValue :
            (cookieValue) ? cookieValue : "";
};
export const readAndUpdatePersistedValue = (key, useCookie) => {
    const urlValue = getUrlParameter(key);
    const storageValue = localStorage.getItem(key);
    let cookieValue = "";
    if (useCookie)
        cookieValue = getCookie(key);
    if (urlValue) {
        updatePersistedValue(key, urlValue, useCookie);
    }
    else if (storageValue) {
        updatePersistedValue(key, storageValue, useCookie);
    }
    else if (cookieValue) {
        updatePersistedValue(key, storageValue, useCookie);
    }
    return (urlValue) ? urlValue :
        (storageValue) ? storageValue :
            (cookieValue) ? cookieValue : "";
};
export const updatePersistedValue = (key, value, useCookie) => {
    localStorage.setItem(key, value);
    if (useCookie)
        setCookie(key, value);
};
export const deletePersistedValue = (item) => {
    localStorage.removeItem(item);
    deleteCookie(item);
};
export const deleteAllPersisted = () => storedKeys.forEach(item => deletePersistedValue(item));
export const readAndUpdateDeviceId = (useCookie) => {
    let storedDeviceId = readAndUpdatePersistedValue(PersistKey.DeviceId, useCookie);
    if (!storedDeviceId) {
        const kvId = `KB${utils.getCurrTimeSec()}T${utils.uuidv4()}`;
        storedDeviceId = kvId.replace(/-/g, "");
    }
    updatePersistedValue(PersistKey.DeviceId, storedDeviceId, useCookie);
    return storedDeviceId;
};
export const readAndUpdateSessionCount = (useCookie) => {
    const storedSessionCount = readAndUpdatePersistedValue(PersistKey.SessionCount, useCookie);
    let sessionCount = 1;
    if (storedSessionCount) {
        sessionCount = parseInt(storedSessionCount);
        sessionCount++;
    }
    updatePersistedValue(PersistKey.SessionCount, sessionCount.toString(), useCookie);
    return sessionCount;
};
