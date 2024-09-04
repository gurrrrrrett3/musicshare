import "dotenv/config";
import ProcessorManager from "./managers/processorManager.js";
import Server from "./server/index.js";

export const processorManager = new ProcessorManager();
processorManager.loadProcessors();
Server.start();