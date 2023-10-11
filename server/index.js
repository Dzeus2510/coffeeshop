const express = require("express");
const cors = require('cors')

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

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });
});