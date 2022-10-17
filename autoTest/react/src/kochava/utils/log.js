/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
import { getMsTime } from "./utils";
var Level;
(function (Level) {
    Level["Off"] = "Off";
    Level["Error"] = "Error";
    Level["Warn"] = "Warn";
    Level["Info"] = "Info";
    Level["Debug"] = "Debug";
    Level["Trace"] = "Trace";
})(Level || (Level = {}));
class Logger {
    constructor() {
        if (Logger.instance)
            return;
        this.levelPrio = {
            Off: 0,
            Error: 1,
            Warn: 2,
            Info: 3,
            Debug: 4,
            Trace: 5,
        };
        this.currLevel = Level.Info;
        this.logObjects = false;
        this.logsFilteredOut = {
            Off: false,
            Error: false,
            Warn: false,
            Info: false,
            Debug: false,
            Trace: false,
            Diag: false,
        };
        Logger.instance = this;
    }
    setLogLevel(input) {
        const levelStr = input[0].toUpperCase() + input.substring(1).toLowerCase();
        const key = levelStr;
        const level = Level[key];
        if (level !== undefined && level !== null) {
            this.currLevel = level;
        }
        else {
            console.log(`Invalid logLevel ${level} passed in, defaulting to info.`);
            this.currLevel = Level.Info;
        }
    }
    getLogLevel() {
        return this.currLevel.toString();
    }
    setLogObjects(enable) {
        this.logObjects = enable;
    }
    disableLogType(input) {
        const levelStr = input[0].toUpperCase() + input.substring(1).toLowerCase();
        const key = levelStr;
        this.logsFilteredOut[key] = true;
    }
    error(msg, ...args) {
        this.print(Level.Error, msg, ...args);
    }
    warn(msg, ...args) {
        this.print(Level.Warn, msg, ...args);
    }
    info(msg, ...args) {
        this.print(Level.Info, msg, ...args);
    }
    debug(msg, ...args) {
        this.print(Level.Debug, msg, ...args);
    }
    trace(msg, ...args) {
        this.print(Level.Trace, msg, ...args);
    }
    diagInfo(msg, ...args) {
        if (!this.logsFilteredOut.Diag)
            this.print(Level.Info, "Kochava Diagnostic - " + msg, ...args);
    }
    diagDebug(msg, ...args) {
        if (!this.logsFilteredOut.Diag)
            this.print(Level.Debug, "Kochava Diagnostic - " + msg, ...args);
    }
    print(lvl, msg, ...args) {
        if (this.levelPrio[this.currLevel.toString()] >= this.levelPrio[lvl.toString()] &&
            !this.logsFilteredOut[lvl.toString()]) {
            try {
                const obj = JSON.parse(args[0]);
                if (this.logObjects && obj) {
                    console.log(`KVA :: ${getMsTime()} ${lvl.toString()}:`, msg, obj);
                }
                else {
                    console.log(`KVA :: ${getMsTime()} ${lvl.toString()}:`, msg, ...args);
                }
            }
            catch (_a) {
                console.log(`KVA :: ${getMsTime()} ${lvl.toString()}:`, msg, ...args);
            }
        }
    }
}
export const Log = new Logger();
