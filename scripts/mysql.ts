import bluebird from 'bluebird';
import * as mysql from 'mysql';
import Connection from 'mysql/lib/Connection';

bluebird.promisifyAll([Connection]);

export const db: any = mysql.createConnection(process.env.DATABASE_URL as string);
