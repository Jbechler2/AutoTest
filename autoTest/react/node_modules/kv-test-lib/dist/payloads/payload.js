/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import * as utils from "../utils/utils";
import { Log } from "../utils/log";
export const constructPayload = (action, instance, originalNtId) => {
    let nt_id = `${instance.kochavaSession}-${instance.kochavaSessionCount}-${utils.uuidv4()}`;
    if (originalNtId) {
        Log.debug("Persisted call found with nt_id:", originalNtId);
        nt_id = originalNtId;
    }
    return {
        action: action,
        kochava_app_id: instance.appGuid,
        kochava_device_id: instance.kochavaDeviceId,
        sdk_version: instance.version,
        sdk_protocol: "17",
        nt_id: nt_id,
        init_token: (instance.kochavaConfig.config.init_token) || undefined,
    };
};
export const constructCommonData = (instance) => {
    const currTime = utils.getCurrTimeMS();
    let uptime = (currTime - instance.startTimeMS) / 1000;
    if (uptime < 0.0)
        uptime = 0.0;
    return {
        starttime: instance.startTimeMS / 1000,
        uptime: uptime,
        usertime: currTime / 1000,
    };
};
