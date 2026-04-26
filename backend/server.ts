import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import path from 'path';

import feedbackRouter from './routes/feedback';
import authRouter from './routes/auth';
import examsRouter from './routes/exams';
import usersRouter from './routes/users';
import announcementsRouter from './routes/announcements';
import { SERVER_CONFIG } from './config/constants';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const REACT_BUILD_FOLDER = path.join(__dirname, '..', 'frontend', 'dist');
app.use(
  express.static(REACT_BUILD_FOLDER, {
    setHeaders: (res, resPath) => {
      if (resPath.endsWith('.css') || resPath.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

app.use(
  '/assets',
  express.static(path.join(REACT_BUILD_FOLDER, 'assets'), {
    setHeaders: (res, resPath) => {
      if (resPath.endsWith('.css') || resPath.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/feedback', feedbackRouter);
app.use('/api/auth', authRouter);
app.use('/api/exams', examsRouter);
app.use('/api/users', usersRouter);
app.use('/api/announcements', announcementsRouter);

app.get('*', (_req, res) => {
  res.sendFile(path.join(REACT_BUILD_FOLDER, 'index.html'));
});

app.use(errorHandler as ErrorRequestHandler);

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server ready on port ${SERVER_CONFIG.PORT}`);
});

export default app;
