import express, { NextFunction, Request, Response } from 'express';
import twilio from 'twilio';
import { createServer } from 'http';
import enforce from 'express-sslify';
import routes from './routes/index.js';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 80;

if (process.env.NODE_ENV === 'development') {

  let corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
  }

  app.use(cors(corsOptions));
} else {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));

const requestFilter = (req: Request, res: Response, next: NextFunction) => {
  res.locals.log = logWithRequestData(req.method, req.path, uuidv4());
  next();
};

const logWithRequestData = (method: string, path: string, id: string) => (...message : any) => {
  console.log(`[${method}][${path}][${id}]`, ...message);
};

app.use(requestFilter);

if (process.env.NODE_ENV != 'development') {
  app.use(twilio.webhook({protocol: 'https'}));
}

app.get('/', (req : Request, res : Response) => {
  res.send('Twilio Webhook is running!')
});

routes(app);

httpServer.listen(PORT, () => {
  console.info(`Application started at ${PORT}`)
});