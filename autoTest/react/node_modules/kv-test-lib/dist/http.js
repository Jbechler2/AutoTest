/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import { Log } from "./utils/log";
export const sendRequest = async (payload, endpoint) => {
    try {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        Log.trace(`Request ${payload.nt_id} being sent to: `, endpoint);
        const resp = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        });
        return await resp.text();
    }
    catch (e) {
        Log.error("Error in post request", e);
        return "";
    }
};
export const wasRespSuccess = (success) => success === "1" || success === 1 || success === true;
