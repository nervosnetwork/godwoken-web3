import createError from "http-errors";
import express from "express";
import logger from "morgan";
import { jaysonMiddleware } from "../middlewares/jayson";
import cors from "cors";
import { wrapper } from "../ws/methods";
import expressWs from "express-ws";
import Sentry from "@sentry/node";
import { applyRateLimitByIp } from "../rate-limit";
import { initSentry } from "../sentry";
import { envConfig } from "../base/env-config";

let newrelic: any | undefined = undefined;
if (envConfig.newRelicLicenseKey) {
  console.log("new relic init !!!");
  newrelic = require("newrelic");
}

const app: express.Express = express();

const BODY_PARSER_LIMIT = "100mb";

app.use(express.json({ limit: BODY_PARSER_LIMIT }));

const sentryOptionRequest = [
  "cookies",
  "data",
  "headers",
  "method",
  "query_string",
  "url",
  "body",
];
if (envConfig.sentryDns) {
  initSentry();

  // The request handler must be the first middleware on the app
  app.use(
    Sentry.Handlers.requestHandler({
      request: sentryOptionRequest,
    })
  );
}

expressWs(app);

const corsOptions: cors.CorsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

app.use(logger("dev"));
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false, limit: BODY_PARSER_LIMIT }));

app.use(
  (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    if (envConfig.newRelicLicenseKey) {
      // set new relic name
      const transactionName = `${req.method} ${req.url}#${req.body.method}`;
      console.log("#transactionName:", transactionName);
      newrelic.setTransactionName(transactionName);
    }

    // log request method / body
    if (process.env.WEB3_LOG_REQUEST_BODY) {
      console.log("request.body:", req.body);
    } else {
      const name = Array.isArray(req.body)
        ? req.body.map((o) => o.method)
        : req.body.method;
      console.log("request.method:", name);
    }
    next();
  }
);

app.use(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // restrict access rate limit via ip
    await applyRateLimitByIp(req, res, next);
  }
);

(app as any).ws("/ws", wrapper);
app.use("/", jaysonMiddleware);

if (envConfig.sentryDns) {
  // The error handler must be before any other error middleware and after all controllers
  app.use(
    Sentry.Handlers.errorHandler({
      // request: sentryOptionRequest,
    })
  );
}

// catch 404 and forward to error handler
app.use(
  (
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    next(createError(404));
  }
);

// error handler
app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  console.error(err.stack);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  console.error("err.status:", err.status);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500);
  res.render("error");
});

export { app };