/* eslint-disable no-console */
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { generate } from '../../utils/bcrypt';
import { User } from '../models';
dotenv.config();

export const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        const existingAdmin = await User.findOne({ where: { [Op.or]: [{ email: adminEmail }, { role: 'admin' }] } });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping seeding.');
            return;
        }
        const hashedPassword = await generate(adminPassword);

        await User.create({
            username: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });

        console.log('Admin user created successfully!');
    } catch (error) {
        console.error('Failed to seed admin user:', error);
    }
};
