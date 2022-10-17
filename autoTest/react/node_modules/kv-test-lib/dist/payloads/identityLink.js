/*
  Authored by Brett Barinaga on 11/18/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as http from "../http";
import * as utils from "../utils/utils";
import { Log } from "../utils/log";
import { constructCommonData } from "./payload";
export const constructPreStart = (instance, idLink) => {
    const preStart = {
        action: "identityLink",
        sdk_version: instance.version,
        sdk_protocol: "17",
        data: {
            identity_link: Object.assign({}, idLink),
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
    postStartBody.data = Object.assign(Object.assign({}, preStartBody.data), constructCommonData(instance));
    return postStartBody;
};
const build = (instance, job) => {
    const payload = Object.assign(Object.assign({}, job.preStartBody), job.postStartBody);
    Log.debug("IdentityLink Payload", JSON.stringify(payload));
    Log.diagDebug(`IdentityLink to be sent as stand alone`);
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
export const send = async (instance, job) => {
    const payload = build(instance, job);
    const respStr = await http.sendRequest(payload, (instance.overrideUrls.identityLink) ?
        instance.overrideUrls.identityLink : instance.kochavaConfig.networking.urls.identityLink);
    let resp;
    let success = false;
    try {
        Log.trace("IdentityLink Response string:", respStr);
        resp = JSON.parse(respStr);
        Log.debug("IdentityLink Response:", respStr);
        success = http.wasRespSuccess(resp.success);
    }
    catch (e) {
        Log.error("Error parsing IdentityLink Response", e);
        success = false;
    }
    if (success) {
        Log.info("IdentityLink success!");
        return true;
    }
    Log.error("IdentityLink failed!");
    return false;
};
