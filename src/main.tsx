import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import React from "react";
import { HashRouter } from "react-router-dom";

import { getLogger, setLoggerConfig } from "evmtools-node/logger";

setLoggerConfig({
  level: "error",
  moduleLogLevels: {
    "domain/TaskRow": "error",
    // "common/utils": "debug",
  },
});

const logger = getLogger("main");
console.log("logger.level:", logger.level);

logger.trace("trace");
logger.debug("debug");
logger.info("info");
logger.warn("warn");
logger.error("error");

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
