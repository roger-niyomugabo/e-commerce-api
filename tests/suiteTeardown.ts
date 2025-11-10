/* eslint-disable no-console */
import { db } from '../src/db';

export default async () => {
    // eslint-disable-next-line no-console
    console.log('TEARING DOWN TESTS');
    await db.close().then(async () => {
        console.log('DB Closed');
        return true;
    }, function (err: any) {
        console.log('DB Close errored');
        console.log(err);
        return true;
    });

    process.exit(0);
};
