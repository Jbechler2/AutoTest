/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as http from "../http";
import * as utils from "../utils/utils";
import { getPackageName } from "../browser/browser";
import { Log } from "../utils/log";
import { constructPayload } from "./payload";
import { DEFAULTS } from "../interfaces";
import { PersistKey, updatePersistedValue } from "../browser/persist";
let timeOut;
let canceled = false;
const build = (instance) => {
    const payload = constructPayload("init", instance);
    payload.build_date = instance.buildDate;
    payload.data = constructKvinitData(instance);
    Log.debug("Kvinit Payload", JSON.stringify(payload));
    return payload;
};
export const cancelRetries = () => {
    canceled = true;
    clearTimeout(timeOut);
};
export const send = async (instance, retryWaterfall, retries = 0) => {
    canceled = false;
    const payload = build(instance);
    let success = false;
    let resp;
    do {
        Log.trace("Kvinit endpoint:", instance.kochavaConfig.networking.urls.init);
        const sendTime = utils.getCurrTimeMS() - instance.startTimeMS;
        Log.diagDebug(`Sending kvinit at ${utils.formatTime(sendTime / 1000)} seconds`);
        const respStr = await http.sendRequest(payload, (instance.overrideUrls.init) ?
            instance.overrideUrls.init : instance.kochavaConfig.networking.urls.init);
        const respTime = utils.getCurrTimeMS() - instance.startTimeMS;
        Log.diagDebug(`Completed kvinit at ${utils.formatTime(respTime / 1000)}
      seconds with a network duration of ${utils.formatTime((respTime - sendTime) / 1000)} seconds`);
        if (canceled) {
            Log.trace("Can no longer retry kvinit, cancelling.");
            return false;
        }
        try {
            resp = JSON.parse(respStr);
            Log.debug("Kvinit Response:", resp);
            success = http.wasRespSuccess(resp.success);
        }
        catch (e) {
            Log.error("Error parsing Kvinit Response", e);
            success = false;
        }
        if (success) {
            Log.info("Kvinit success!");
            updatePersistedValue(PersistKey.LastKvinit, JSON.stringify(resp), instance.useCookies);
            return success;
        }
        if (!canceled) {
            // retry kvinit
            const retryIndex = (retries > retryWaterfall.length - 1) ? retryWaterfall.length - 1 : retries;
            const retrySec = retryWaterfall[retryIndex];
            Log.error(`Kvinit failed, attempting again in ${retrySec} seconds`);
            await new Promise(resolve => { timeOut = setTimeout(resolve, retrySec * 1000); });
            retries++;
        }
    } while (!success && !canceled);
};
export const applyKvinitResp = (instance, resp) => {
    if (resp.general) {
        if (resp.general.device_id_override) {
            Log.trace(`Device_id override found, going from ${instance.kochavaDeviceId} to
        ${resp.general.device_id_override}`);
            instance.kochavaConfig.general.device_id_override = resp.general.device_id_override;
            instance.kochavaDeviceId = resp.general.device_id_override;
            updatePersistedValue(PersistKey.OverrideDeviceId, resp.general.device_id_override, instance.useCookies);
        }
        if (resp.general.app_id_override) {
            Log.trace(`App_id override found, going from ${instance.appGuid} to
        ${resp.general.app_id_override}`);
            instance.kochavaConfig.general.app_id_override = resp.general.app_id_override;
            instance.appGuid = resp.general.app_id_override;
            updatePersistedValue(PersistKey.OverrideAppId, resp.general.app_id_override, instance.useCookies);
        }
    }
    if (resp.config) {
        instance.kochavaConfig.config = {
            init_token: resp.config.init_token || DEFAULTS.config.init_token,
            refresh_minimum: (resp.config.refresh_minimum !== undefined &&
                resp.config.refresh_minimum !== null) ? resp.config.refresh_minimum :
                DEFAULTS.config.refresh_minimum,
        };
    }
    if (resp.install) {
        if (resp.install.resend_id) {
            instance.kochavaConfig.install.resend_id = resp.install.resend_id;
        }
        instance.kochavaConfig.install.updates_enabled =
            resp.install.updates_enabled || DEFAULTS.install.updates_enabled;
    }
    if (resp.networking) {
        instance.kochavaConfig.networking.retry_waterfall =
            resp.networking.retry_waterfall || DEFAULTS.networking.retry_waterfall;
        instance.retryWaterfall =
            instance.kochavaConfig.networking.retry_waterfall;
        if (resp.networking.urls) {
            instance.kochavaConfig.networking.urls = {
                init: resp.networking.urls.init || DEFAULTS.networking.urls.init,
                install: resp.networking.urls.install || DEFAULTS.networking.urls.install,
                event: resp.networking.urls.event || DEFAULTS.networking.urls.event,
                identityLink: resp.networking.urls.identityLink || DEFAULTS.networking.urls.identityLink,
            };
        }
    }
    if (resp.privacy) {
        instance.kochavaConfig.privacy = {
            allow_custom_ids: resp.privacy.allow_custom_ids || DEFAULTS.privacy.allow_custom_ids,
            deny_datapoints: resp.privacy.deny_datapoints || DEFAULTS.privacy.deny_datapoints,
            deny_event_names: resp.privacy.deny_event_names || DEFAULTS.privacy.deny_event_names,
            deny_identity_links: resp.privacy.deny_identity_links || DEFAULTS.privacy.deny_identity_links,
        };
    }
};
const constructKvinitData = (instance) => {
    const currTime = Math.floor(Date.now() / 1000);
    let uptime = (currTime - instance.startTimeMS) / 1000;
    if (uptime < 0.0)
        uptime = 0.0;
    return {
        package: getPackageName(),
        platform: "web",
        starttime: instance.startTimeMS / 1000,
        uptime,
        usertime: currTime,
    };
};
