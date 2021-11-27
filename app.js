require('dotenv').config();

const connectDB = require('./db/connect');
const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');

//async errors
require('express-async-errors');

const app = express();
app.use(cors());
const notFoundMiddleware = require('./middleware/not-found');
const errorMiddleware = require('./middleware/error-handler');

app.use(express.json());

//routes

app.get('/', (req, res) => {
  res.send('<h1>Store Api</h1><a href="/api/v1/products">products route</a>');
});

app.use('/api/v1/products', productsRouter);

//middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

//products route

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    //connectDB
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
