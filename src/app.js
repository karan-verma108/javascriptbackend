import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { datalimit } from './contants';

const app = express();
//let's define the cors origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, //in order to send cookies or authentication tokens (like JWT) with cross-origin requests(requests from one origin to another), then this option (credentials) must be set to true
  })
);

//let's parse incoming json data that will come from http requests
app.use(express.json({ limit: datalimit }));

// let's also parse data that will come in the form of URL-encoded format typically coming from HTML forms. When the extended is set to true, it means it will parse even nested objects (more complex data such as an array of objects) and not just single key-value pairs of data
app.use(express.urlencoded({ extended: true, limit: datalimit }));

// to server static files like images, style-sheets or client side javascript, without having to create seperate routes for them, we use express.static() middleware for it
app.use(express.static('public'));

// for parsing cookies that will be stored on the client side and will be sent to the server
app.use(cookieParser());

export { app };
