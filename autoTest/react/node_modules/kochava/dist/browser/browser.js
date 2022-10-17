/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
export const getPackageName = () => `com.${window.location.hostname}.web`;
export const getLanguage = () => (navigator) ? navigator.language : "";
export const getDeviceWidth = () => (window) ? window.screen.availWidth : 0;
export const getDeviceHeight = () => (window) ? window.screen.availHeight : 0;
export const getDeviceOrientation = () => (window) ? window.innerWidth < window.innerHeight
    ? "portrait" : "landscape" : "";
export const getBaseDomain = () => {
    try {
        const regexResult = window.location.host.match(/[^.]*\.[^.]*$/);
        if (regexResult)
            return regexResult[0];
        return "";
    }
    catch (err) {
        return window.location.host;
    }
};
export const getPageName = () => {
    let page = "";
    if (window.location) {
        page = window.location.pathname.substring(1);
        page = page.replace(/\/+$/, "");
    }
    return page === "" ? "/" : page;
};
export const getUrlParameter = (name) => {
    if (!window.location || !window.location.search) {
        return "";
    }
    name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    const results = regex.exec(window.location.search);
    return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
};
