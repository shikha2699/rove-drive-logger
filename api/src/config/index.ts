export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  dbPushMaxRetries: 30,
  dbPushRetryDelayMs: 2000,
};
