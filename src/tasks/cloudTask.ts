import { parseTaskArgs } from "../taskOptions.js";
import { runBrowserTask } from "../browserTask.js";

const options = parseTaskArgs(process.argv.slice(2));
const result = await runBrowserTask(options);
console.log(JSON.stringify(result, null, 2));
