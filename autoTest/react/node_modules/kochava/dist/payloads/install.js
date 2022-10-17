/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as http from "../http";
import * as utils from "../utils/utils";
import * as browser from "../browser/browser";
import { Log } from "../utils/log";
import { constructPayload } from "./payload";
import { getPersistedIdentityLinks, PersistKey, readAndUpdatePersistedValue, updatePersistedValue } from "../browser/persist";
let timeOut;
let canceled = false;
export const build = (instance) => {
    const payload = constructPayload("install", instance);
    instance.installStarted = true;
    payload.data = constructInstallData(instance);
    Log.debug("Install Payload", JSON.stringify(payload));
    if (instance.kochavaConfig.privacy) {
        instance.kochavaConfig.privacy.deny_datapoints.forEach(denyPoint => {
            for (const point in payload.data) {
                const key = point;
                if (key === denyPoint)
                    delete payload.data[key];
            }
            for (const point in payload) {
                const key = point;
                if (key === denyPoint)
                    delete payload[key];
            }
        });
    }
    return payload;
};
export const cancelRetries = () => {
    canceled = true;
    clearTimeout(timeOut);
};
export const send = async (instance, payload, retries = 0) => {
    canceled = false;
    let success = false;
    let resp;
    do {
        const sendTime = utils.getCurrTimeMS() - instance.startTimeMS;
        Log.diagDebug(`Sending install at ${utils.formatTime(sendTime / 1000)} seconds`);
        const respStr = await http.sendRequest(payload, (instance.overrideUrls.install) ?
            instance.overrideUrls.install : instance.kochavaConfig.networking.urls.install);
        const respTime = utils.getCurrTimeMS() - instance.startTimeMS;
        Log.diagDebug(`Completed install at ${new Date().toLocaleTimeString()} 
      seconds with a network duration of ${utils.formatTime((respTime - sendTime) / 1000)} seconds`);
        if (canceled) {
            Log.trace("Can no longer retry install, cancelling.");
            return false;
        }
        try {
            Log.trace("Install Response string:", respStr);
            resp = JSON.parse(respStr);
            Log.debug("Install Response:", respStr);
            success = http.wasRespSuccess(resp.success);
        }
        catch (e) {
            Log.error("Error parsing Install Response", e);
            success = false;
        }
        if (success) {
            Log.info("Install success!");
            return success;
        }
        if (!canceled) {
            const retryWaterfall = instance.kochavaConfig.networking.retry_waterfall;
            const retryIndex = (retries > retryWaterfall.length - 1) ? retryWaterfall.length - 1 : retries;
            const retrySec = retryWaterfall[retryIndex];
            Log.error(`Install failed, attempting again in ${retrySec} seconds`);
            await new Promise(resolve => { timeOut = setTimeout(resolve, retrySec * 1000); });
            retries++;
        }
    } while (!success && !canceled);
};
export const onSuccess = (instance) => {
    instance.kochavaInstallDate = utils.getCurrTimeMS();
    updatePersistedValue(PersistKey.InstallSentDate, String(instance.kochavaInstallDate), instance.useCookies);
};
const constructInstallData = (instance) => {
    const currTime = Math.floor(Date.now() / 1000);
    let uptime = (currTime - instance.startTimeMS) / 1000;
    if (uptime < 0.0)
        uptime = 0.0;
    let returnObj = {
        starttime: instance.startTimeMS / 1000,
        uptime: uptime,
        usertime: determineInstallUserTime(instance, currTime),
        device_orientation: browser.getDeviceOrientation(),
        package: browser.getPackageName(),
        disp_w: browser.getDeviceWidth(),
        disp_h: browser.getDeviceHeight(),
        language: browser.getLanguage(),
    };
    if (instance.utm) {
        returnObj = Object.assign(Object.assign({}, returnObj), { conversion_data: { utm_source: instance.utm } });
    }
    if (instance.customValues.length > 0)
        returnObj.device_ids = {};
    instance.customValues.forEach((custom) => {
        const customKey = Object.keys(custom.data)[0];
        if (instance.kochavaConfig.privacy) {
            let keyAllowed = false;
            for (const allowed of instance.kochavaConfig.privacy.allow_custom_ids) {
                if (customKey === allowed) {
                    keyAllowed = true;
                }
            }
            if (keyAllowed) {
                if (custom.isDeviceId)
                    returnObj.device_ids = Object.assign(Object.assign({}, returnObj.device_ids), custom.data);
                else
                    returnObj = Object.assign(Object.assign({}, custom.data), returnObj);
            }
        }
    });
    // add the persisted identityLinks
    const persistedIdLinks = getPersistedIdentityLinks();
    if (persistedIdLinks) {
        returnObj.identity_link = {};
        for (const key in persistedIdLinks) {
            let includeKey = true;
            for (const denyIdLinkKey of instance.kochavaConfig.privacy.deny_identity_links) {
                if (denyIdLinkKey === key) {
                    Log.debug(`Denied identity_link ${denyIdLinkKey}, dropping from install.`);
                    includeKey = false;
                }
            }
            if (includeKey)
                returnObj.identity_link[key] = persistedIdLinks[key];
        }
    }
    return returnObj;
};
const determineInstallUserTime = (instance, currTime) => {
    const firstStartStr = readAndUpdatePersistedValue(PersistKey.FirstStartDate, instance.useCookies);
    if (firstStartStr) {
        const firstStart = JSON.parse(firstStartStr);
        // If its been 30 days since the sdk started
        if ((currTime - firstStart) > 2592000) {
            return currTime;
        }
        return firstStart;
    }
    return currTime;
};
