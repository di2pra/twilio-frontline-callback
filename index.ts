import express from 'express';
import { createServer } from 'http';
import enforce from 'express-sslify';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 80;

if (process.env.NODE_ENV != 'development') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));

/*const requestFilter = (req: Request, res: Response, next: NextFunction) => {
  res.locals.log = logWithRequestData(req.method, req.path, uuidv4());
  next();
};

const logWithRequestData = (method: string, path: string, id: string) => (...message : any) => {
  console.log(`[${method}][${path}][${id}]`, ...message);
};

app.use(requestFilter);*/

routes(app);

app.get('/index.html', (_, res) => {
  res.redirect('/');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.info(`Application started at ${PORT}`)
});