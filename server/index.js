const express = require("express");
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json())
app.use(cors())

const db = require('./models')

// Routers
const cafeRouter = require("./routes/Cafes");
app.use("/cafes", cafeRouter);
const reviewRouter = require("./routes/Reviews");
app.use("/reviews", reviewRouter);
const userRouter = require("./routes/Users");
app.use("/auth", userRouter);
const favouriteRouter = require("./routes/Favourites");
app.use("/favourites", favouriteRouter);

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Cafe Express API with Swagger",
            version: "0.1.0",
            description:
                "This is a simple CRUD API application made with Express and documented with Swagger",
            contact: {
                name: "xD",
                url: "https://google.com",
                email: "vuvuvu2510@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3001",
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });
});