/*
  Authored by Brett Barinaga on 11/17/21.
  Copyright (c) Kochava, Inc. All rights reserved.
*/
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Kochava_instances, _Kochava_instance, _Kochava_jobQueue, _Kochava_resetInstance, _Kochava_initInstance, _Kochava_checkFirstLaunchAndMigrate, _Kochava_checkPersistedKvinit, _Kochava_checkPersistedState, _Kochava_printStartupMsgs, _Kochava_beginStart, _Kochava_performNewKvinit, _Kochava_checkResendId, _Kochava_performInstall;
import { Log } from "./utils/log";
import JobQueue from "./jobqueue";
import * as Kvinit from "./payloads/kvinit";
import * as Install from "./payloads/install";
import { DEFAULTS, } from "./interfaces";
import { deleteAllPersisted, readAndUpdatePersistedValue, updatePersistedValue, PersistKey, checkDuplicateIdLink, addPersistedIdLinks, checkInstallIdChange, readAndUpdateSessionCount, readAndUpdateDeviceId, readAndUpdateUTM, } from "./browser/persist";
import * as utils from "./utils/utils";
import { getPageName } from "./browser/browser";
// NOTE: Update this with new releases.
const SDK_VERSION = "3.0.4";
export class Kochava {
    // User will use the below factories instead of directly calling 
    // the constructor
    constructor() {
        _Kochava_instances.add(this);
        _Kochava_instance.set(this, void 0);
        _Kochava_jobQueue.set(this, void 0);
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_resetInstance).call(this);
        __classPrivateFieldSet(this, _Kochava_jobQueue, new JobQueue(), "f");
    }
    // ============================= PUBLIC =============================== //
    static create() {
        return new Kochava();
    }
    static createForNode() {
        const kochava = new Kochava();
        kochava.executeAdvancedInstruction("wrapper", JSON.stringify({ name: "Node", version: "" }));
        return kochava;
    }
    static createForReact() {
        const kochava = new Kochava();
        kochava.executeAdvancedInstruction("wrapper", JSON.stringify({ name: "React", version: "" }));
        return kochava;
    }
    static createForVue() {
        const kochava = new Kochava();
        kochava.executeAdvancedInstruction("wrapper", JSON.stringify({ name: "Vue", version: "" }));
        return kochava;
    }
    static createForAngular() {
        const kochava = new Kochava();
        kochava.executeAdvancedInstruction("wrapper", JSON.stringify({ name: "Angular", version: "1.0.0" }));
        return kochava;
    }
    /*
      Set if the SDK should also store persisted values in cookie storage.
      - Not all values can be persisted in cookies, such as event/idlink queues
        due to size constraints.
      - true = yes use cookies
      - no = no don't use cookies
      - defaults to false
    */
    useCookies(condition = false) {
        __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies = condition;
    }
    /*
      - Set whether the sdk shouldn't automatically send a page or should.
      - true = no auto page
      - false = yes auto page
      - defaults to false
    */
    disableAutoPage(condition = false) {
        __classPrivateFieldGet(this, _Kochava_instance, "f").disableAutoPage = condition;
    }
    /*
      The primary means for starting the sdk.
      Responsibilites:
      - Checks for migrations.
      - Creates the sdk instance.
      - Checks for persisted state.
      - Determines and sends kvinit.
      - Determines and sends install.
      - Optionally enqueues an auto_page.
      - Starts the job queue.
    */
    startWithAppGuid(appGuid) {
        if (!appGuid) {
            Log.error(`Invalid appGuid ${appGuid}, start failed.`);
            return;
        }
        if (!__classPrivateFieldGet(this, _Kochava_instance, "f"))
            __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_resetInstance).call(this);
        if (__classPrivateFieldGet(this, _Kochava_instance, "f").started) {
            Log.warn("Kochava SDK already started.");
            return;
        }
        Log.diagDebug(`Host called API: Start With App Guid ${appGuid}`);
        __classPrivateFieldGet(this, _Kochava_instance, "f").started = true;
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_checkFirstLaunchAndMigrate).call(this);
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_initInstance).call(this, appGuid);
        if (!__classPrivateFieldGet(this, _Kochava_instance, "f").disableAutoPage)
            this.sendPageEvent();
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_checkPersistedState).call(this);
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_checkPersistedKvinit).call(this);
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_printStartupMsgs).call(this, appGuid);
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_beginStart).call(this);
    }
    /*
      Primary means for stopping the sdk.
      Will optionally delete all persisted data, and will shutdown the
      sdk and job queue.
    */
    shutdown(deleteData) {
        Log.diagDebug(`Host called API: Shutdown and ${deleteData ? "delete data" : "keep data"}`);
        if (deleteData) {
            Log.debug("Deleting persisted values");
            deleteAllPersisted();
        }
        if (!__classPrivateFieldGet(this, _Kochava_instance, "f").started) {
            Log.warn("SDK already shutdown.");
        }
        Log.info("SDK shutting down.");
        Kvinit.cancelRetries();
        Install.cancelRetries();
        __classPrivateFieldGet(this, _Kochava_jobQueue, "f").stop();
        // wipe whatever was previously in the queue
        __classPrivateFieldSet(this, _Kochava_jobQueue, new JobQueue(), "f");
        __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_resetInstance).call(this);
    }
    /*
      Changes the current logLevel.
      Options include:
      - Off   :: No logging whatsoever
      - Error :: Only critical errors
      - Warn  :: Only critical errors and non-critical warnings
      - Info  :: High-level sdk behavior logs (default)
      - Debug :: More in-depth sdk behavior logs and payload logs
      - Trace :: Everything, granular detail
    */
    setLogLevel(logLevel) {
        Log.diagDebug(`Host called API: Set Log Level ${logLevel}`);
        Log.setLogLevel(logLevel);
    }
    /*
      Used internally, for special SDK behavior not utilized by a client.
      Examples include:
      - urls    :: purposefully changing an endpoint for testing
      - wrapper :: overwriting the version of a wrapper
      several more ...
    */
    executeAdvancedInstruction(key, valueStr, callback) {
        Log.diagDebug(`Host called API: Execute Advanced Instruction ${key}`);
        switch (key) {
            case "wrapper":
                {
                    const wrapperVersion = JSON.parse(valueStr);
                    if (!__classPrivateFieldGet(this, _Kochava_instance, "f").version)
                        __classPrivateFieldGet(this, _Kochava_instance, "f").version = "WebTracker " + SDK_VERSION;
                    switch (wrapperVersion.name) {
                        case "Angular":
                            __classPrivateFieldGet(this, _Kochava_instance, "f").version += ` (${wrapperVersion.name} ${wrapperVersion.version})`;
                            break;
                        default:
                            __classPrivateFieldGet(this, _Kochava_instance, "f").version += ` (${wrapperVersion.name})`;
                            break;
                    }
                }
                break;
            case "urls":
                {
                    const overrideUrls = JSON.parse(valueStr);
                    if (overrideUrls.init)
                        __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.init = overrideUrls.init;
                    if (overrideUrls.event)
                        __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.event = overrideUrls.event;
                    if (overrideUrls.install)
                        __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.install = overrideUrls.install;
                    if (overrideUrls.identityLink)
                        __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.identityLink = overrideUrls.identityLink;
                }
                break;
            case "urlsRestore":
                {
                    const restoreUrls = JSON.parse(valueStr);
                    for (const url of restoreUrls) {
                        if (url === "init")
                            __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.init = DEFAULTS.networking.urls.init;
                        if (url === "event")
                            __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.event = DEFAULTS.networking.urls.event;
                        if (url === "install")
                            __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.install =
                                DEFAULTS.networking.urls.install;
                        if (url === "identityLink")
                            __classPrivateFieldGet(this, _Kochava_instance, "f").overrideUrls.identityLink =
                                DEFAULTS.networking.urls.identityLink;
                    }
                }
                break;
            case "logFilter":
                {
                    const disabled = JSON.parse(valueStr);
                    disabled.forEach((level) => Log.disableLogType(level));
                }
                break;
            case "getInstance":
                {
                    const currInstance = JSON.stringify(__classPrivateFieldGet(this, _Kochava_instance, "f"));
                    callback(currInstance);
                    Log.debug(`capturing instance: ${valueStr}`);
                }
                break;
            case "logObjects":
                Log.setLogObjects(JSON.parse(valueStr));
                break;
            default:
                break;
        }
    }
    /*
      Builds and enqueues a kochava event. Must include an event_name string,
      with optional event_data as either another string or object.
    */
    sendEvent(name, data) {
        Log.diagDebug(`Host called API: Send Event`);
        if (!name) {
            Log.warn("Invalid event name, ignoring call.");
            return;
        }
        __classPrivateFieldGet(this, _Kochava_jobQueue, "f").enqueueEvent(__classPrivateFieldGet(this, _Kochava_instance, "f"), [name, data]);
    }
    /*
      Wraps the sendEvent call with predefined data specific to page events.
    */
    sendPageEvent(pageName, additionalData) {
        if (pageName)
            this.sendEvent("page", Object.assign({ page_name: pageName }, additionalData));
        else
            this.sendEvent("page", Object.assign({ page_name: getPageName() }, additionalData));
    }
    /*
      - Registers new identity links with the sdk, either to be sent out with
        the install, or standalone.
      - Will update an identity link if its key already exists in storage.
      - A max of 10 identity links are currently allowed to be stored
        at any one time.
    */
    registerIdentityLink(name, identifier) {
        Log.diagDebug(`Host called API: Register Identity Link ${name}`);
        if (!name || !identifier) {
            Log.warn("Invalid identity link, ignoring call.");
            return;
        }
        if (checkDuplicateIdLink(name, identifier)) {
            Log.debug("Duplicate Identity Link found, ignoring.");
            return;
        }
        const idLink = {};
        idLink[name] = identifier;
        addPersistedIdLinks(name, identifier, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
        // if (this.#instance.installStarted || this.#instance.installDone) {
        if (localStorage.getItem("com.kochava.tracker.InstallSentDate")) {
            // it will be sent standalone
            __classPrivateFieldGet(this, _Kochava_jobQueue, "f").enqueueIdLink(__classPrivateFieldGet(this, _Kochava_instance, "f"), idLink);
        }
        // will be sent in install
    }
    // Allows the client to attach arbitrary data to certain payloads. 
    registerCustomValue(name, value) {
        Log.diagDebug(`Host called API: Register Custom Value ${name}`);
        if (!name || !value) {
            Log.warn("Invalid custom value, ignoring call.");
            return;
        }
        const dataToAdorn = {};
        dataToAdorn[name] = value;
        __classPrivateFieldGet(this, _Kochava_instance, "f").customValues.push({ data: dataToAdorn, isDeviceId: false });
    }
    // Allows the client to attach arbitrary identifiers to go out in the install. 
    registerCustomDeviceIdentifier(name, value) {
        Log.diagDebug(`Host called API: Register Custom Device Identifier ${name}`);
        if (!name || !value) {
            Log.warn("Invalid custom device identifier, ignoring call.");
            return;
        }
        const dataToAdorn = {};
        dataToAdorn[name] = value;
        __classPrivateFieldGet(this, _Kochava_instance, "f").customValues.push({ data: dataToAdorn, isDeviceId: true });
    }
    /*
      Returns whether or not the sdk is in a "started" state.
      This basically amounts to if start has been called,
      not if kvinit is done or the queue is started.
      Likewise, shutdown will set "started" to false;
    */
    getStarted() {
        return __classPrivateFieldGet(this, _Kochava_instance, "f").started;
    }
    /*
      Returns the current kochavaDeviceId, or "" if called too early.
    */
    getDeviceId() {
        Log.diagDebug(`Host called API: Get Kochava Device Id`);
        if (__classPrivateFieldGet(this, _Kochava_instance, "f").started)
            return __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaDeviceId;
        else
            return "";
    }
    /*
      Puts the sdk in a "sleep" state. This will stop the sdk from dequeuing
      new jobs and retrying failed jobs. Different than shutdown, because the
      current state is not destroyed.
    */
    setSleep(sleep) {
        Log.diagDebug(`Host called API: Sleep ${sleep ? "Stop" : "Start"}`);
        if (sleep && !__classPrivateFieldGet(this, _Kochava_instance, "f").sleep) {
            // only pause if it was running
            __classPrivateFieldGet(this, _Kochava_instance, "f").sleep = sleep;
            __classPrivateFieldGet(this, _Kochava_jobQueue, "f").pause();
        }
        else if (!sleep && __classPrivateFieldGet(this, _Kochava_instance, "f").sleep) {
            // only resume queueing if it was paused
            __classPrivateFieldGet(this, _Kochava_instance, "f").sleep = sleep;
            __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_beginStart).call(this);
        }
    }
}
_Kochava_instance = new WeakMap(), _Kochava_jobQueue = new WeakMap(), _Kochava_instances = new WeakSet(), _Kochava_resetInstance = function _Kochava_resetInstance() {
    __classPrivateFieldSet(this, _Kochava_instance, {
        appGuid: "",
        started: false,
        installStarted: false,
        kvinitDone: false,
        installDone: false,
        disableAutoPage: false,
        useCookies: false,
        sleep: false,
        version: "",
        buildDate: "",
        overrideUrls: {
            init: "",
            install: "",
            event: "",
            identityLink: "",
        },
        customValues: [],
        kochavaSession: "",
        retryWaterfall: [],
        startTimeMS: 0,
        utm: "",
        kochavaDeviceId: "",
        kochavaInstallId: "",
        kochavaSessionCount: -1,
        kochavaInstallDate: -1,
        kochavaConfig: undefined,
    }, "f");
}, _Kochava_initInstance = function _Kochava_initInstance(appGuid) {
    // init instance with defaults
    __classPrivateFieldGet(this, _Kochava_instance, "f").appGuid = appGuid;
    __classPrivateFieldGet(this, _Kochava_instance, "f").disableAutoPage = __classPrivateFieldGet(this, _Kochava_instance, "f").disableAutoPage || false;
    __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies = __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies || false;
    __classPrivateFieldGet(this, _Kochava_instance, "f").version = __classPrivateFieldGet(this, _Kochava_instance, "f").version || "WebTracker " + SDK_VERSION;
    __classPrivateFieldGet(this, _Kochava_instance, "f").buildDate = "kbd: 10/14/2022, 1:54:22 PM";
    __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaSession = utils.uuidv4().substring(0, 5);
    __classPrivateFieldGet(this, _Kochava_instance, "f").startTimeMS = utils.getCurrTimeMS();
    __classPrivateFieldGet(this, _Kochava_instance, "f").retryWaterfall = [7, 30, 300, 1800];
    __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaConfig = JSON.parse(JSON.stringify(DEFAULTS));
}, _Kochava_checkFirstLaunchAndMigrate = function _Kochava_checkFirstLaunchAndMigrate() {
    // If this is our first launch ever, set it in persistence.
    if (!readAndUpdatePersistedValue(PersistKey.FirstStartDate, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies)) {
        updatePersistedValue(PersistKey.FirstStartDate, String(utils.getCurrTimeSec()), __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
        /*
          On a first launch of the v3 sdk, we need to migrate old persisted kv_id
          from v2.2, v2.3, and v2.5
        */
        // perform migration
        const oldKvId = readAndUpdatePersistedValue(PersistKey.OldKvid, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
        if (oldKvId) {
            updatePersistedValue(PersistKey.DeviceId, oldKvId, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
            updatePersistedValue(PersistKey.InstallSentDate, JSON.stringify(utils.getCurrTimeSec()), __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
        }
    }
}, _Kochava_checkPersistedKvinit = function _Kochava_checkPersistedKvinit() {
    // check if persisted kvinit
    let persistedKvinit = {};
    const persistedKvinitStr = readAndUpdatePersistedValue(PersistKey.LastKvinit, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    if (persistedKvinitStr) {
        persistedKvinit = JSON.parse(persistedKvinitStr);
        if (persistedKvinit) {
            // if persisted kvinit, apply it
            Log.trace("Found persisted kvinit.", persistedKvinit);
            Kvinit.applyKvinitResp(__classPrivateFieldGet(this, _Kochava_instance, "f"), persistedKvinit);
            Log.trace("KochavaConfig after persistedKvinit:", JSON.parse(JSON.stringify(__classPrivateFieldGet(this, _Kochava_instance, "f").kochavaConfig)));
        }
    }
    // check refresh minimum too
    const persistedKvinitDateStr = readAndUpdatePersistedValue(PersistKey.KvinitSentDate, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    if (persistedKvinitDateStr) {
        const lastKvinitDate = JSON.parse(persistedKvinitDateStr);
        if (lastKvinitDate) {
            const refreshMin = __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaConfig.config.refresh_minimum;
            if (utils.getCurrTimeSec() - lastKvinitDate < refreshMin)
                __classPrivateFieldGet(this, _Kochava_instance, "f").kvinitDone = true;
        }
    }
}, _Kochava_checkPersistedState = function _Kochava_checkPersistedState() {
    __classPrivateFieldGet(this, _Kochava_instance, "f").installDone =
        readAndUpdatePersistedValue(PersistKey.InstallSentDate, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies).length > 0;
    __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaInstallId = readAndUpdatePersistedValue(PersistKey.InstallId, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaDeviceId = readAndUpdateDeviceId(__classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaSessionCount = readAndUpdateSessionCount(__classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    __classPrivateFieldGet(this, _Kochava_instance, "f").utm = readAndUpdateUTM(__classPrivateFieldGet(this, _Kochava_instance, "f").appGuid, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
}, _Kochava_printStartupMsgs = function _Kochava_printStartupMsgs(appGuid) {
    Log.diagInfo(`Started SDK ${__classPrivateFieldGet(this, _Kochava_instance, "f").version}
      published ${__classPrivateFieldGet(this, _Kochava_instance, "f").buildDate}`);
    Log.diagInfo(`The log level is set to ${Log.getLogLevel()}`);
    Log.diagDebug(`This ${!__classPrivateFieldGet(this, _Kochava_instance, "f").installDone ? "is" : "is not"} the first tracker SDK launch`);
    Log.diagDebug(`The kochava device id is ${__classPrivateFieldGet(this, _Kochava_instance, "f").kochavaDeviceId}`);
    Log.diagDebug(`The kochava app GUID provided was ${appGuid}`);
}, _Kochava_beginStart = async function _Kochava_beginStart() {
    // if we need to send a new kvinit, send it
    if (!__classPrivateFieldGet(this, _Kochava_instance, "f").kvinitDone) {
        Log.diagDebug(`A new kvinit will be sent`);
        await __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_performNewKvinit).call(this);
    }
    else {
        Log.diagDebug(`A new kvinit will not be sent`);
    }
    // if the install_id changed and thus a new install must go out
    if (__classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_checkResendId).call(this))
        __classPrivateFieldGet(this, _Kochava_instance, "f").installDone = false;
    Log.diagDebug(`The install ${__classPrivateFieldGet(this, _Kochava_instance, "f").installDone ? "has already" : "has not yet"} been sent`);
    if (__classPrivateFieldGet(this, _Kochava_instance, "f").sleep)
        return;
    if (!__classPrivateFieldGet(this, _Kochava_instance, "f").installDone) {
        await __classPrivateFieldGet(this, _Kochava_instances, "m", _Kochava_performInstall).call(this);
    }
    if (__classPrivateFieldGet(this, _Kochava_instance, "f").kvinitDone && __classPrivateFieldGet(this, _Kochava_instance, "f").installDone) {
        await __classPrivateFieldGet(this, _Kochava_jobQueue, "f").start(__classPrivateFieldGet(this, _Kochava_instance, "f"));
    }
}, _Kochava_performNewKvinit = async function _Kochava_performNewKvinit() {
    __classPrivateFieldGet(this, _Kochava_instance, "f").kvinitDone = await Kvinit.send(__classPrivateFieldGet(this, _Kochava_instance, "f"), __classPrivateFieldGet(this, _Kochava_instance, "f").retryWaterfall);
    updatePersistedValue(PersistKey.KvinitSentDate, String(utils.getCurrTimeSec()), __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    // if new kvinit, apply it
    let newKvinit = {};
    const newKvinitStr = readAndUpdatePersistedValue(PersistKey.LastKvinit, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    if (newKvinitStr) {
        newKvinit = JSON.parse(newKvinitStr);
    }
    Kvinit.applyKvinitResp(__classPrivateFieldGet(this, _Kochava_instance, "f"), newKvinit);
    Log.trace("KochavaConfig after new Kvinit:", JSON.parse(JSON.stringify(__classPrivateFieldGet(this, _Kochava_instance, "f").kochavaConfig)));
}, _Kochava_checkResendId = function _Kochava_checkResendId() {
    let resendId = "";
    if (__classPrivateFieldGet(this, _Kochava_instance, "f").kochavaConfig.install) {
        resendId = __classPrivateFieldGet(this, _Kochava_instance, "f").kochavaConfig.install.resend_id;
    }
    const needsNewInstall = checkInstallIdChange(resendId, __classPrivateFieldGet(this, _Kochava_instance, "f").useCookies);
    if (needsNewInstall) {
        Log.debug(`resend_id ${resendId} found, forcing new install`);
    }
    return needsNewInstall;
}, _Kochava_performInstall = async function _Kochava_performInstall() {
    const request = Install.build(__classPrivateFieldGet(this, _Kochava_instance, "f"));
    __classPrivateFieldGet(this, _Kochava_instance, "f").installDone = await Install.send(__classPrivateFieldGet(this, _Kochava_instance, "f"), request);
    if (!__classPrivateFieldGet(this, _Kochava_instance, "f").installDone)
        return;
    // If the install succeeded, remove all idLink that were passed to it
    Install.onSuccess(__classPrivateFieldGet(this, _Kochava_instance, "f"));
    updatePersistedValue(PersistKey.IdLinkQueue, JSON.stringify(__classPrivateFieldGet(this, _Kochava_jobQueue, "f").idLinkQueue), false);
};
// Only here for generic Web integration
window.kochava = Kochava.create();
