import "./App.css";

import { Kochava } from "./kochava/kochava";
import { initTestSetup, processSuite, SuiteId } from "./testRunner";

declare global {
  interface Window {
    delay: any;
    test: any;
  }
}


function App(props: any) {
  const kochava: Kochava = props.kochava;
  kochava.setLogLevel("Trace");

  initTestSetup(kochava);

  const buttonData = [
    {
      label: "startWithAppGuid",
      func: () => {
        kochava.disableAutoPage(true);
        kochava.startWithAppGuid("kowebsdkv3-7pv0");
      },
    },
    {
      label: "shutdown(deleteData)",
      func: () => {
        kochava.shutdown(true);
      },
    },
    {
      label: "getDeviceId",
      func: () => {
        console.log(kochava.getDeviceId());
      },
    },
    {
      label: "sendEvents",
      func: () => {
        kochava.sendEvent("MyEvent");

        kochava.sendPageEvent("MyPage");

        kochava.sendEvent("MyEventString", "Some event data");

        const dataDictionary = {
          name: "ev_name",
          type: "ev_type",
        }
        kochava.sendEvent("MyEventWithDictionary", dataDictionary);
      },
    },
    {
      label: "allTests",
      func: async () => {
        await processSuite(SuiteId.ALL);
      },
    },
    {
      label: "developmentTests",
      func: async () => {
        await processSuite(SuiteId.DEVELOPMENT);
      },
    },
    {
      label: "basics",
      func: async () => {
        await processSuite(SuiteId.BASICS);
      },
    },
    {
      label: "eventTests",
      func: async () => {
        await processSuite(SuiteId.EVENT);
      },
    },
    {
      label: "initTests",
      func: async () => {
        await processSuite(SuiteId.INIT);
      },
    },
    {
      label: "installTests",
      func: async () => {
        await processSuite(SuiteId.INSTALL);
      },
    },
  ];


  const buttons = buttonData.map(obj => {
    return (
      <button key={obj.label} onClick={obj.func}>{obj.label}</button>
    );
  });

  return (
    <div className="App">
      <h1>Web SDK Test System - React <img src="/src/logo.svg"></img></h1>
      <ul>
        {buttons}
      </ul>
    </div>
  );
}

export default App;
