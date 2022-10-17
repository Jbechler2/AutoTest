/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
export const DEFAULTS = {
    general: {
        // DO NOT DEFAULT
        app_id_override: "",
        // DO NOT DEFAULT
        device_id_override: "",
    },
    config: {
        init_token: "",
        refresh_minimum: 60,
    },
    install: {
        // DO NOT DEFAULT
        resend_id: "",
        updates_enabled: true,
    },
    networking: {
        urls: {
            init: "https://kvinit-prod.api.kochava.com/track/kvinit",
            install: "https://web-sdk.control.kochava.com/track/json/",
            event: "https://web-sdk.control.kochava.com/track/json/",
            identityLink: "https://web-sdk.control.kochava.com/track/json/"
        },
        retry_waterfall: [7, 30, 300, 1800],
    },
    privacy: {
        allow_custom_ids: [],
        deny_datapoints: [],
        deny_event_names: [],
        deny_identity_links: [],
    },
};
