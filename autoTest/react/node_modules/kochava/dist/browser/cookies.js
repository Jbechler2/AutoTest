/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import { getBaseDomain } from "./browser";
export const setCookie = (name, value) => {
    let expires = "";
    const date = new Date();
    date.setTime(date.getTime() + 3650 * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
    document.cookie =
        name +
            "=" +
            (value || "") +
            expires +
            "; path=/;domain=" +
            getBaseDomain();
};
export const getCookie = (name) => {
    const nameEQ = name + "=";
    const charArray = document.cookie.split(';');
    for (let i = 0; i < charArray.length; i++) {
        let char = charArray[i];
        while (char.charAt(0) === " ")
            char = char.substring(1, char.length);
        if (char.indexOf(nameEQ) === 0)
            return char.substring(nameEQ.length, char.length);
    }
    return "";
};
export const deleteCookie = (name) => {
    if (getCookie(name)) {
        const path = "/";
        const domain = getBaseDomain();
        document.cookie = name + "=" +
            ((path) ? ";path=" + path : "") +
            ((domain) ? ";domain=" + domain : "") +
            ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
};
