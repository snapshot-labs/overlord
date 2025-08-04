import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rpc from './rpc';
import pkg from '../package.json';

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.use('/', rpc);
app.get('/', (req, res) => {
  const commit = process.env.COMMIT_HASH || '';
  const version = commit ? `${pkg.version}#${commit.substr(0, 7)}` : pkg.version;
  res.json({ version, port: PORT });
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
