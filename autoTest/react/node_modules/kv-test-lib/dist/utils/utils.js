/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
export const uuidv4 = () => {
    return (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
};
// returns the number of milliseconds elapsed since January 1, 1970 
export const getCurrTimeMS = () => Math.floor(Date.now());
// returns the number of seconds elapsed since January 1, 1970 
export const getCurrTimeSec = () => Math.floor(Date.now() / 1000);
export const formatTime = (num) => {
    if (num < 10 && num % 10 <= 9)
        return "0" + num.toFixed(1).toString();
    else
        return num.toFixed(1).toString();
};
export const getMsTime = () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
};
