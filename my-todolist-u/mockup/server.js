const path = require("path");
const express = require("express");
const { createMockMiddleware } = require("openapi-mock-express-middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("../swagger/swagger.json");

const specPath = path.resolve(__dirname, "../swagger/swagger.json");

const app = express();
app.use("/api", createMockMiddleware({ spec: specPath }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(4010, () => {
  console.log("Mock server running at http://localhost:4010");
  console.log("Swagger UI at http://localhost:4010/docs");
});
