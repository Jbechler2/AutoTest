import { Kochava } from "./kochava/kochava";

export enum SuiteId {
  ALL = 1,
  DEVELOPMENT = 6,
  BASICS = 15,
  EVENT = 7,
  INIT = 5,
  INSTALL = 22,
}

enum ActionType {
  advancedInstruction = "advancedInstruction",
  setLogLevel = "setLogLevel",
  setSleep = "setSleep",
  registerCustomDeviceIdentifier = "registerCustomDeviceIdentifier",
  // newly added to test system
  registerCustomValue = "registerCustomValue",
  registerIdentityLink = "registerIdentityLink",
  startWithAppGuid = "startWithAppGuid",
  shutdown = "shutdown",
  getStarted = "getStarted",
  getDeviceId = "getDeviceId",
  sendEvent = "sendEvent",
  sendEventWithString = "sendEventWithString",
  sendEventWithDictionary = "sendEventWithDictionary",
  sendEventWithEvent = "sendEventWithEvent",


  // newly added to test system
  sendPageEvent = "sendPageEvent",
}

interface Action {
  post_delay: number;
  action: ActionType;
  parameters: any;
}

interface Test {
  name: string;
  test_run_id: string;
}

interface Suite {
  suite_run_id: number;
  tests: Test[]
  Result: string;
}

const SERVER_HOST_NAME = "https://sdktesting.dev.kochava.com";

let kochava: Kochava;

async function delay(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms * 1000)
  });
}

export function initTestSetup(kosdk: Kochava) {
  kochava = kosdk;
}

export async function processSuite(suiteId: SuiteId) {
  const resp = await post(`/api/tracker/startsuite?platform=Web&sdk=WebNative&sdk_type=TrackerGen4&suite_id=${suiteId}`, "")

  log("<------------------------------------------------------------------------------------>");
  log("Start Test Suite", resp);
  log("<------------------------------------------------------------------------------------>");

  const suite: Suite = JSON.parse(resp);

  for (const test of suite.tests) {
    await processTest(test);
  }

  const stopResp = await post(`/api/tracker/stopsuite?suite_run_id=${suite.suite_run_id}`, "");
  const result = JSON.parse(stopResp);

  log("<------------------------------------------------------------------------------------>");
  log("End Test Suite: Result: " + result.Result);
  log("<------------------------------------------------------------------------------------>");
}

async function processTest(test: Test) {
  log("<------------------------------------------------------------------------------------>");
  log("Start Test: " + test.name);
  log("<------------------------------------------------------------------------------------>");

  const resp = await post(`/api/tracker/starttest?test_run_id=${test.test_run_id}`, "{}");
  log("actionsString: " + resp);

  const actions: Action[] = JSON.parse(resp);

  for (const action of actions) {
    const startActionTime = new Date().getTime();
    await processAction(action, test.test_run_id);
    log("Action took time:", (new Date().getTime() - startActionTime));

    const startedWaitingTime = new Date().getTime();
    log(`Action ${action.action} Expecting to wait ${action.post_delay * 1000}`);
    await delay(action.post_delay);
    const actualWait = new Date().getTime() - startedWaitingTime;
    log(`Action ${action.action} Actually waited ${actualWait}`);

    const delta = actualWait - (action.post_delay * 1000);

    if (Math.abs(delta) > 100) {
      log(`WARNING :: Action ${action.action} took ${delta} ms longer than expected`);
    }
  }

  const stopResp = await post(`/api/tracker/stoptest?test_run_id=${test.test_run_id}`, "");
  const result = JSON.parse(stopResp);

  log("<------------------------------------------------------------------------------------>");
  log(`End Test: ${test.name}. Result: ${result.Result}`);
  log("<------------------------------------------------------------------------------------>");

}

async function processAction(action: Action, testRunId: string) {
  const {
    name,
    data,
    value,
    logLevel,
    sleep,
    appGuid,
    deleteData
  } = action.parameters;
  switch (action.action) {
    case ActionType.advancedInstruction:
      kochava.executeAdvancedInstruction(name, value);
      break;
    case ActionType.setLogLevel:
      kochava.setLogLevel(logLevel);
      break;
    case ActionType.setSleep:
      kochava.setSleep(sleep);
      break;
    case ActionType.registerCustomDeviceIdentifier:
      kochava.registerCustomDeviceIdentifier(name, value);
      break;
    case ActionType.registerCustomValue:
      kochava.registerCustomValue(name, value);
      break;
    case ActionType.registerIdentityLink:
      kochava.registerIdentityLink(name, value);
      break;
    case ActionType.startWithAppGuid: {
      kochava.disableAutoPage(true);
      kochava.useCookies(false);
      kochava.startWithAppGuid(appGuid);
    } break;
    case ActionType.shutdown:
      kochava.shutdown(deleteData);
      break;
    case ActionType.getStarted: {
      const started = kochava.getStarted();
      await post(`/api/tracker/extra/getStarted?test_run_id=${testRunId}`, started.toString());
    } break;
    case ActionType.getDeviceId: {
      const deviceId = kochava.getDeviceId();
      await post(`/api/tracker/extra/getDeviceId?test_run_id=${testRunId}`, deviceId.toString());
    } break;
    case ActionType.sendEvent:
      kochava.sendEvent(name);
      break;
    case ActionType.sendEventWithString:
      kochava.sendEvent(name, data as string);
      break;
    case ActionType.sendEventWithDictionary:
      kochava.sendEvent(name, data as { [key: string]: any });
      break;
    case ActionType.sendEventWithEvent:
      break;
    case ActionType.sendPageEvent:
      kochava.sendPageEvent(name, data as { [key: string]: any });
      break;
    default:
      log("Unknown Action: " + action.action);
  }
}

function log(...msg: any) { console.log("Kochava/Tracker:", ...msg); }

async function post(endpoint: string, payload: string) {
  const url = SERVER_HOST_NAME + endpoint;

  log(`post: url: ${url} payload: ${payload}`);

  const headers: Headers = new Headers();
  headers.append("Content-Type", "application/json");

  const resp = await fetch(url, {
    method: "POST",
    headers: headers,
    body: payload,
  });

  return await resp.text();
}

