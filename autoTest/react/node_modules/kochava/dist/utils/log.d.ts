declare enum Level {
    Off = "Off",
    Error = "Error",
    Warn = "Warn",
    Info = "Info",
    Debug = "Debug",
    Trace = "Trace"
}
declare class Logger {
    private currLevel;
    private logObjects;
    private levelPrio;
    private logsFilteredOut;
    static instance: Logger;
    constructor();
    setLogLevel(input: string): void;
    getLogLevel(): string;
    setLogObjects(enable: boolean): void;
    disableLogType(input: string): void;
    error(msg: string, ...args: any): void;
    warn(msg: string, ...args: any): void;
    info(msg: string, ...args: any): void;
    debug(msg: string, ...args: any): void;
    trace(msg: string, ...args: any): void;
    diagInfo(msg: string, ...args: any): void;
    diagDebug(msg: string, ...args: any): void;
    print(lvl: Level, msg: string, ...args: any): void;
}
export declare const Log: Logger;
export {};
