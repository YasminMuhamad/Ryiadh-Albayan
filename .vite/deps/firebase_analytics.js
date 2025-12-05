import "./chunk-2LTAJOLT.js";
import {
  Component,
  ErrorFactory,
  FirebaseError,
  Logger,
  _getProvider,
  _registerComponent,
  areCookiesEnabled,
  calculateBackoffMillis,
  deepEqual,
  getApp,
  getModularInstance,
  isBrowserExtension,
  isIndexedDBAvailable,
  registerVersion,
  validateIndexedDBOpenable
} from "./chunk-HY7UPOO6.js";
import "./chunk-G3PMV62Z.js";

// node_modules/@firebase/analytics/dist/esm/index.esm.js
var ANALYTICS_TYPE = "analytics";
var GA_FID_KEY = "firebase_id";
var ORIGIN_KEY = "origin";
var FETCH_TIMEOUT_MILLIS = 60 * 1e3;
var DYNAMIC_CONFIG_URL = "https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig";
var GTAG_URL = "https://www.googletagmanager.com/gtag/js";
var logger = new Logger("@firebase/analytics");
var ERRORS = {
  [
    "already-exists"
    /* AnalyticsError.ALREADY_EXISTS */
  ]: "A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.",
  [
    "already-initialized"
    /* AnalyticsError.ALREADY_INITIALIZED */
  ]: "initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.",
  [
    "already-initialized-settings"
    /* AnalyticsError.ALREADY_INITIALIZED_SETTINGS */
  ]: "Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",
  [
    "interop-component-reg-failed"
    /* AnalyticsError.INTEROP_COMPONENT_REG_FAILED */
  ]: "Firebase Analytics Interop Component failed to instantiate: {$reason}",
  [
    "invalid-analytics-context"
    /* AnalyticsError.INVALID_ANALYTICS_CONTEXT */
  ]: "Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "indexeddb-unavailable"
    /* AnalyticsError.INDEXEDDB_UNAVAILABLE */
  ]: "IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "fetch-throttle"
    /* AnalyticsError.FETCH_THROTTLE */
  ]: "The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.",
  [
    "config-fetch-failed"
    /* AnalyticsError.CONFIG_FETCH_FAILED */
  ]: "Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}",
  [
    "no-api-key"
    /* AnalyticsError.NO_API_KEY */
  ]: 'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',
  [
    "no-app-id"
    /* AnalyticsError.NO_APP_ID */
  ]: 'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',
  [
    "no-client-id"
    /* AnalyticsError.NO_CLIENT_ID */
  ]: 'The "client_id" field is empty.',
  [
    "invalid-gtag-resource"
    /* AnalyticsError.INVALID_GTAG_RESOURCE */
  ]: "Trusted Types detected an invalid gtag resource: {$gtagURL}."
};
var ERROR_FACTORY = new ErrorFactory("analytics", "Analytics", ERRORS);
function createGtagTrustedTypesScriptURL(url) {
  if (!url.startsWith(GTAG_URL)) {
    const err = ERROR_FACTORY.create("invalid-gtag-resource", {
      gtagURL: url
    });
    logger.warn(err.message);
    return "";
  }
  return url;
}
function promiseAllSettled(promises) {
  return Promise.all(promises.map((promise) => promise.catch((e) => e)));
}
function createTrustedTypesPolicy(policyName, policyOptions) {
  let trustedTypesPolicy;
  if (window.trustedTypes) {
    trustedTypesPolicy = window.trustedTypes.createPolicy(policyName, policyOptions);
  }
  return trustedTypesPolicy;
}
function insertScriptTag(dataLayerName2, measurementId) {
  const trustedTypesPolicy = createTrustedTypesPolicy("firebase-js-sdk-policy", {
    createScriptURL: createGtagTrustedTypesScriptURL
  });
  const script = document.createElement("script");
  const gtagScriptURL = `${GTAG_URL}?l=${dataLayerName2}&id=${measurementId}`;
  script.src = trustedTypesPolicy ? trustedTypesPolicy?.createScriptURL(gtagScriptURL) : gtagScriptURL;
  script.async = true;
  document.head.appendChild(script);
}
function getOrCreateDataLayer(dataLayerName2) {
  let dataLayer = [];
  if (Array.isArray(window[dataLayerName2])) {
    dataLayer = window[dataLayerName2];
  } else {
    window[dataLayerName2] = dataLayer;
  }
  return dataLayer;
}
async function gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams) {
  const correspondingAppId = measurementIdToAppId2[measurementId];
  try {
    if (correspondingAppId) {
      await initializationPromisesMap2[correspondingAppId];
    } else {
      const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList2);
      const foundConfig = dynamicConfigResults.find((config) => config.measurementId === measurementId);
      if (foundConfig) {
        await initializationPromisesMap2[foundConfig.appId];
      }
    }
  } catch (e) {
    logger.error(e);
  }
  gtagCore("config", measurementId, gtagParams);
}
async function gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams) {
  try {
    let initializationPromisesToWaitFor = [];
    if (gtagParams && gtagParams["send_to"]) {
      let gaSendToList = gtagParams["send_to"];
      if (!Array.isArray(gaSendToList)) {
        gaSendToList = [gaSendToList];
      }
      const dynamicConfigResults = await promiseAllSettled(dynamicConfigPromisesList2);
      for (const sendToId of gaSendToList) {
        const foundConfig = dynamicConfigResults.find((config) => config.measurementId === sendToId);
        const initializationPromise = foundConfig && initializationPromisesMap2[foundConfig.appId];
        if (initializationPromise) {
          initializationPromisesToWaitFor.push(initializationPromise);
        } else {
          initializationPromisesToWaitFor = [];
          break;
        }
      }
    }
    if (initializationPromisesToWaitFor.length === 0) {
      initializationPromisesToWaitFor = Object.values(initializationPromisesMap2);
    }
    await Promise.all(initializationPromisesToWaitFor);
    gtagCore("event", measurementId, gtagParams || {});
  } catch (e) {
    logger.error(e);
  }
}
function wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2) {
  async function gtagWrapper(command, ...args) {
    try {
      if (command === "event") {
        const [measurementId, gtagParams] = args;
        await gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams);
      } else if (command === "config") {
        const [measurementId, gtagParams] = args;
        await gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams);
      } else if (command === "consent") {
        const [consentAction, gtagParams] = args;
        gtagCore("consent", consentAction, gtagParams);
      } else if (command === "get") {
        const [measurementId, fieldName, callback] = args;
        gtagCore("get", measurementId, fieldName, callback);
      } else if (command === "set") {
        const [customParams] = args;
        gtagCore("set", customParams);
      } else {
        gtagCore(command, ...args);
      }
    } catch (e) {
      logger.error(e);
    }
  }
  return gtagWrapper;
}
function wrapOrCreateGtag(initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, dataLayerName2, gtagFunctionName) {
  let gtagCore = function(..._args) {
    window[dataLayerName2].push(arguments);
  };
  if (window[gtagFunctionName] && typeof window[gtagFunctionName] === "function") {
    gtagCore = window[gtagFunctionName];
  }
  window[gtagFunctionName] = wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2);
  return {
    gtagCore,
    wrappedGtag: window[gtagFunctionName]
  };
}
function findGtagScriptOnPage(dataLayerName2) {
  const scriptTags = window.document.getElementsByTagName("script");
  for (const tag of Object.values(scriptTags)) {
    if (tag.src && tag.src.includes(GTAG_URL) && tag.src.includes(dataLayerName2)) {
      return tag;
    }
  }
  return null;
}
var LONG_RETRY_FACTOR = 30;
var BASE_INTERVAL_MILLIS = 1e3;
var RetryData = class {
  constructor(throttleMetadata = {}, intervalMillis = BASE_INTERVAL_MILLIS) {
    this.throttleMetadata = throttleMetadata;
    this.intervalMillis = intervalMillis;
  }
  getThrottleMetadata(appId) {
    return this.throttleMetadata[appId];
  }
  setThrottleMetadata(appId, metadata) {
    this.throttleMetadata[appId] = metadata;
  }
  deleteThrottleMetadata(appId) {
    delete this.throttleMetadata[appId];
  }
};
var defaultRetryData = new RetryData();
function getHeaders(apiKey) {
  return new Headers({
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
async function fetchDynamicConfig(appFields) {
  const { appId, apiKey } = appFields;
  const request = {
    method: "GET",
    headers: getHeaders(apiKey)
  };
  const appUrl = DYNAMIC_CONFIG_URL.replace("{app-id}", appId);
  const response = await fetch(appUrl, request);
  if (response.status !== 200 && response.status !== 304) {
    let errorMessage = "";
    try {
      const jsonResponse = await response.json();
      if (jsonResponse.error?.message) {
        errorMessage = jsonResponse.error.message;
      }
    } catch (_ignored) {
    }
    throw ERROR_FACTORY.create("config-fetch-failed", {
      httpStatus: response.status,
      responseMessage: errorMessage
    });
  }
  return response.json();
}
async function fetchDynamicConfigWithRetry(app, retryData = defaultRetryData, timeoutMillis) {
  const { appId, apiKey, measurementId } = app.options;
  if (!appId) {
    throw ERROR_FACTORY.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!apiKey) {
    if (measurementId) {
      return {
        measurementId,
        appId
      };
    }
    throw ERROR_FACTORY.create(
      "no-api-key"
      /* AnalyticsError.NO_API_KEY */
    );
  }
  const throttleMetadata = retryData.getThrottleMetadata(appId) || {
    backoffCount: 0,
    throttleEndTimeMillis: Date.now()
  };
  const signal = new AnalyticsAbortSignal();
  setTimeout(async () => {
    signal.abort();
  }, timeoutMillis !== void 0 ? timeoutMillis : FETCH_TIMEOUT_MILLIS);
  return attemptFetchDynamicConfigWithRetry({ appId, apiKey, measurementId }, throttleMetadata, signal, retryData);
}
async function attemptFetchDynamicConfigWithRetry(appFields, { throttleEndTimeMillis, backoffCount }, signal, retryData = defaultRetryData) {
  const { appId, measurementId } = appFields;
  try {
    await setAbortableTimeout(signal, throttleEndTimeMillis);
  } catch (e) {
    if (measurementId) {
      logger.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${e?.message}]`);
      return { appId, measurementId };
    }
    throw e;
  }
  try {
    const response = await fetchDynamicConfig(appFields);
    retryData.deleteThrottleMetadata(appId);
    return response;
  } catch (e) {
    const error = e;
    if (!isRetriableError(error)) {
      retryData.deleteThrottleMetadata(appId);
      if (measurementId) {
        logger.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${error?.message}]`);
        return { appId, measurementId };
      } else {
        throw e;
      }
    }
    const backoffMillis = Number(error?.customData?.httpStatus) === 503 ? calculateBackoffMillis(backoffCount, retryData.intervalMillis, LONG_RETRY_FACTOR) : calculateBackoffMillis(backoffCount, retryData.intervalMillis);
    const throttleMetadata = {
      throttleEndTimeMillis: Date.now() + backoffMillis,
      backoffCount: backoffCount + 1
    };
    retryData.setThrottleMetadata(appId, throttleMetadata);
    logger.debug(`Calling attemptFetch again in ${backoffMillis} millis`);
    return attemptFetchDynamicConfigWithRetry(appFields, throttleMetadata, signal, retryData);
  }
}
function setAbortableTimeout(signal, throttleEndTimeMillis) {
  return new Promise((resolve, reject) => {
    const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
    const timeout = setTimeout(resolve, backoffMillis);
    signal.addEventListener(() => {
      clearTimeout(timeout);
      reject(ERROR_FACTORY.create("fetch-throttle", {
        throttleEndTimeMillis
      }));
    });
  });
}
function isRetriableError(e) {
  if (!(e instanceof FirebaseError) || !e.customData) {
    return false;
  }
  const httpStatus = Number(e.customData["httpStatus"]);
  return httpStatus === 429 || httpStatus === 500 || httpStatus === 503 || httpStatus === 504;
}
var AnalyticsAbortSignal = class {
  constructor() {
    this.listeners = [];
  }
  addEventListener(listener) {
    this.listeners.push(listener);
  }
  abort() {
    this.listeners.forEach((listener) => listener());
  }
};
var defaultEventParametersForInit;
async function logEvent$1(gtagFunction, initializationPromise, eventName, eventParams, options) {
  if (options && options.global) {
    gtagFunction("event", eventName, eventParams);
    return;
  } else {
    const measurementId = await initializationPromise;
    const params = {
      ...eventParams,
      "send_to": measurementId
    };
    gtagFunction("event", eventName, params);
  }
}
async function setCurrentScreen$1(gtagFunction, initializationPromise, screenName, options) {
  if (options && options.global) {
    gtagFunction("set", { "screen_name": screenName });
    return Promise.resolve();
  } else {
    const measurementId = await initializationPromise;
    gtagFunction("config", measurementId, {
      update: true,
      "screen_name": screenName
    });
  }
}
async function setUserId$1(gtagFunction, initializationPromise, id, options) {
  if (options && options.global) {
    gtagFunction("set", { "user_id": id });
    return Promise.resolve();
  } else {
    const measurementId = await initializationPromise;
    gtagFunction("config", measurementId, {
      update: true,
      "user_id": id
    });
  }
}
async function setUserProperties$1(gtagFunction, initializationPromise, properties, options) {
  if (options && options.global) {
    const flatProperties = {};
    for (const key of Object.keys(properties)) {
      flatProperties[`user_properties.${key}`] = properties[key];
    }
    gtagFunction("set", flatProperties);
    return Promise.resolve();
  } else {
    const measurementId = await initializationPromise;
    gtagFunction("config", measurementId, {
      update: true,
      "user_properties": properties
    });
  }
}
async function internalGetGoogleAnalyticsClientId(gtagFunction, initializationPromise) {
  const measurementId = await initializationPromise;
  return new Promise((resolve, reject) => {
    gtagFunction("get", measurementId, "client_id", (clientId) => {
      if (!clientId) {
        reject(ERROR_FACTORY.create(
          "no-client-id"
          /* AnalyticsError.NO_CLIENT_ID */
        ));
      }
      resolve(clientId);
    });
  });
}
async function setAnalyticsCollectionEnabled$1(initializationPromise, enabled) {
  const measurementId = await initializationPromise;
  window[`ga-disable-${measurementId}`] = !enabled;
}
var defaultConsentSettingsForInit;
function _setConsentDefaultForInit(consentSettings) {
  defaultConsentSettingsForInit = consentSettings;
}
function _setDefaultEventParametersForInit(customParams) {
  defaultEventParametersForInit = customParams;
}
async function validateIndexedDB() {
  if (!isIndexedDBAvailable()) {
    logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", {
      errorInfo: "IndexedDB is not available in this environment."
    }).message);
    return false;
  } else {
    try {
      await validateIndexedDBOpenable();
    } catch (e) {
      logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", {
        errorInfo: e?.toString()
      }).message);
      return false;
    }
  }
  return true;
}
async function _initializeAnalytics(app, dynamicConfigPromisesList2, measurementIdToAppId2, installations, gtagCore, dataLayerName2, options) {
  const dynamicConfigPromise = fetchDynamicConfigWithRetry(app);
  dynamicConfigPromise.then((config) => {
    measurementIdToAppId2[config.measurementId] = config.appId;
    if (app.options.measurementId && config.measurementId !== app.options.measurementId) {
      logger.warn(`The measurement ID in the local Firebase config (${app.options.measurementId}) does not match the measurement ID fetched from the server (${config.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`);
    }
  }).catch((e) => logger.error(e));
  dynamicConfigPromisesList2.push(dynamicConfigPromise);
  const fidPromise = validateIndexedDB().then((envIsValid) => {
    if (envIsValid) {
      return installations.getId();
    } else {
      return void 0;
    }
  });
  const [dynamicConfig, fid] = await Promise.all([
    dynamicConfigPromise,
    fidPromise
  ]);
  if (!findGtagScriptOnPage(dataLayerName2)) {
    insertScriptTag(dataLayerName2, dynamicConfig.measurementId);
  }
  if (defaultConsentSettingsForInit) {
    gtagCore("consent", "default", defaultConsentSettingsForInit);
    _setConsentDefaultForInit(void 0);
  }
  gtagCore("js", /* @__PURE__ */ new Date());
  const configProperties = options?.config ?? {};
  configProperties[ORIGIN_KEY] = "firebase";
  configProperties.update = true;
  if (fid != null) {
    configProperties[GA_FID_KEY] = fid;
  }
  gtagCore("config", dynamicConfig.measurementId, configProperties);
  if (defaultEventParametersForInit) {
    gtagCore("set", defaultEventParametersForInit);
    _setDefaultEventParametersForInit(void 0);
  }
  return dynamicConfig.measurementId;
}
var AnalyticsService = class {
  constructor(app) {
    this.app = app;
  }
  _delete() {
    delete initializationPromisesMap[this.app.options.appId];
    return Promise.resolve();
  }
};
var initializationPromisesMap = {};
var dynamicConfigPromisesList = [];
var measurementIdToAppId = {};
var dataLayerName = "dataLayer";
var gtagName = "gtag";
var gtagCoreFunction;
var wrappedGtagFunction;
var globalInitDone = false;
function settings(options) {
  if (globalInitDone) {
    throw ERROR_FACTORY.create(
      "already-initialized"
      /* AnalyticsError.ALREADY_INITIALIZED */
    );
  }
  if (options.dataLayerName) {
    dataLayerName = options.dataLayerName;
  }
  if (options.gtagName) {
    gtagName = options.gtagName;
  }
}
function warnOnBrowserContextMismatch() {
  const mismatchedEnvMessages = [];
  if (isBrowserExtension()) {
    mismatchedEnvMessages.push("This is a browser extension environment.");
  }
  if (!areCookiesEnabled()) {
    mismatchedEnvMessages.push("Cookies are not available.");
  }
  if (mismatchedEnvMessages.length > 0) {
    const details = mismatchedEnvMessages.map((message, index) => `(${index + 1}) ${message}`).join(" ");
    const err = ERROR_FACTORY.create("invalid-analytics-context", {
      errorInfo: details
    });
    logger.warn(err.message);
  }
}
function factory(app, installations, options) {
  warnOnBrowserContextMismatch();
  const appId = app.options.appId;
  if (!appId) {
    throw ERROR_FACTORY.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!app.options.apiKey) {
    if (app.options.measurementId) {
      logger.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${app.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);
    } else {
      throw ERROR_FACTORY.create(
        "no-api-key"
        /* AnalyticsError.NO_API_KEY */
      );
    }
  }
  if (initializationPromisesMap[appId] != null) {
    throw ERROR_FACTORY.create("already-exists", {
      id: appId
    });
  }
  if (!globalInitDone) {
    getOrCreateDataLayer(dataLayerName);
    const { wrappedGtag, gtagCore } = wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagName);
    wrappedGtagFunction = wrappedGtag;
    gtagCoreFunction = gtagCore;
    globalInitDone = true;
  }
  initializationPromisesMap[appId] = _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCoreFunction, dataLayerName, options);
  const analyticsInstance = new AnalyticsService(app);
  return analyticsInstance;
}
function getAnalytics(app = getApp()) {
  app = getModularInstance(app);
  const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    return analyticsProvider.getImmediate();
  }
  return initializeAnalytics(app);
}
function initializeAnalytics(app, options = {}) {
  const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    const existingInstance = analyticsProvider.getImmediate();
    if (deepEqual(options, analyticsProvider.getOptions())) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY.create(
        "already-initialized"
        /* AnalyticsError.ALREADY_INITIALIZED */
      );
    }
  }
  const analyticsInstance = analyticsProvider.initialize({ options });
  return analyticsInstance;
}
async function isSupported() {
  if (isBrowserExtension()) {
    return false;
  }
  if (!areCookiesEnabled()) {
    return false;
  }
  if (!isIndexedDBAvailable()) {
    return false;
  }
  try {
    const isDBOpenable = await validateIndexedDBOpenable();
    return isDBOpenable;
  } catch (error) {
    return false;
  }
}
function setCurrentScreen(analyticsInstance, screenName, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setCurrentScreen$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], screenName, options).catch((e) => logger.error(e));
}
async function getGoogleAnalyticsClientId(analyticsInstance) {
  analyticsInstance = getModularInstance(analyticsInstance);
  return internalGetGoogleAnalyticsClientId(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId]);
}
function setUserId(analyticsInstance, id, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setUserId$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], id, options).catch((e) => logger.error(e));
}
function setUserProperties(analyticsInstance, properties, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setUserProperties$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], properties, options).catch((e) => logger.error(e));
}
function setAnalyticsCollectionEnabled(analyticsInstance, enabled) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setAnalyticsCollectionEnabled$1(initializationPromisesMap[analyticsInstance.app.options.appId], enabled).catch((e) => logger.error(e));
}
function setDefaultEventParameters(customParams) {
  if (wrappedGtagFunction) {
    wrappedGtagFunction("set", customParams);
  } else {
    _setDefaultEventParametersForInit(customParams);
  }
}
function logEvent(analyticsInstance, eventName, eventParams, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  logEvent$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], eventName, eventParams, options).catch((e) => logger.error(e));
}
function setConsent(consentSettings) {
  if (wrappedGtagFunction) {
    wrappedGtagFunction("consent", "update", consentSettings);
  } else {
    _setConsentDefaultForInit(consentSettings);
  }
}
var name = "@firebase/analytics";
var version = "0.10.19";
function registerAnalytics() {
  _registerComponent(new Component(
    ANALYTICS_TYPE,
    (container, { options: analyticsOptions }) => {
      const app = container.getProvider("app").getImmediate();
      const installations = container.getProvider("installations-internal").getImmediate();
      return factory(app, installations, analyticsOptions);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    "analytics-internal",
    internalFactory,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name, version);
  registerVersion(name, version, "esm2020");
  function internalFactory(container) {
    try {
      const analytics = container.getProvider(ANALYTICS_TYPE).getImmediate();
      return {
        logEvent: (eventName, eventParams, options) => logEvent(analytics, eventName, eventParams, options),
        setUserProperties: (properties, options) => setUserProperties(analytics, properties, options)
      };
    } catch (e) {
      throw ERROR_FACTORY.create("interop-component-reg-failed", {
        reason: e
      });
    }
  }
}
registerAnalytics();
export {
  getAnalytics,
  getGoogleAnalyticsClientId,
  initializeAnalytics,
  isSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
  setConsent,
  setCurrentScreen,
  setDefaultEventParameters,
  setUserId,
  setUserProperties,
  settings
};
//# sourceMappingURL=firebase_analytics.js.map
