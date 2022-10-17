/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as http from "../http";
import * as utils from "../utils/utils";
import * as browser from "../browser/browser";
import { Log } from "../utils/log";
import { constructCommonData } from "./payload";
export const constructPreStart = (instance, eventName, eventData) => {
    const preStart = {
        action: "event",
        sdk_version: instance.version,
        sdk_protocol: "17",
        data: {
            event_name: eventName,
            event_data: eventData,
            device_orientation: browser.getDeviceOrientation(),
            disp_w: browser.getDeviceWidth(),
            disp_h: browser.getDeviceHeight(),
        },
    };
    if (instance.kochavaConfig)
        preStart.init_token = (instance.kochavaConfig.config.init_token) || undefined;
    return preStart;
};
export const constructPostStart = (instance, preStartBody) => {
    const postStartBody = {
        kochava_app_id: instance.appGuid,
        kochava_device_id: instance.kochavaDeviceId,
        nt_id: `${instance.kochavaSession}-${instance.kochavaSessionCount}-${utils.uuidv4()}`,
    };
    postStartBody.data = Object.assign(Object.assign({}, constructCommonData(instance)), preStartBody.data);
    instance.customValues.forEach((custom) => {
        if (!custom.isDeviceId) {
            const customKey = Object.keys(custom.data)[0];
            if (instance.kochavaConfig.privacy) {
                let keyAllowed = false;
                for (const allowed of instance.kochavaConfig.privacy.allow_custom_ids) {
                    if (customKey === allowed) {
                        keyAllowed = true;
                    }
                }
                if (keyAllowed)
                    postStartBody.data = Object.assign(Object.assign({}, custom.data), postStartBody.data);
            }
        }
    });
    return postStartBody;
};
const build = (instance, preStartBody, postStartBody) => {
    const payload = Object.assign(Object.assign({}, preStartBody), postStartBody);
    Log.debug("Event Payload", JSON.stringify(payload));
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
export const send = async (instance, preStartBody, postStartBody) => {
    const payload = build(instance, preStartBody, postStartBody);
    const respStr = await http.sendRequest(payload, (instance.overrideUrls.event) ?
        instance.overrideUrls.event : instance.kochavaConfig.networking.urls.event);
    let resp;
    let success = false;
    try {
        Log.trace("Event Response string:", respStr);
        resp = JSON.parse(respStr);
        Log.debug("Event Response:", respStr);
        success = http.wasRespSuccess(resp.success);
    }
    catch (e) {
        Log.error("Error parsing Event Response", e);
        success = false;
    }
    if (success) {
        Log.info("Event success!");
        return true;
    }
    Log.error("Event failed!");
    return false;
};
