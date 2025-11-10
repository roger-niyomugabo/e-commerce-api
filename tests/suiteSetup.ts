/* eslint-disable no-console */
import { db } from '../src/db';

export default async () => {
    // eslint-disable-next-line no-console
    console.log('SETTING UP TESTS');
    // Syn the database with force set to true so all data is cleared before executing tests
    await db.sync({ force: true, alter: true }).then(async () => {
        console.log('Test DB synced');
        return true;
    }, function (err: any) {
        console.log('DB Erroring');
        console.log(err);
        return true;
    });
};
