import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.clientUrl.split(',').map((origin) => origin.trim()), credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'alayaa-backend', status: 'healthy' });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`ALAYAA backend listening on port ${env.port}`);
});
