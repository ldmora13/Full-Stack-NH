import { db } from '../lib/db';
import { hash } from '@node-rs/argon2';

async function createAdmin() {
    try {
        // Admin credentials
        const email = 'contact.new.horizons.us@gmail.com';
        const password = 'NewHorizons123';
        const name = 'Administrador';

        // Check if admin already exists
        const existingAdmin = await db.user.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            console.log('🔄 Admin user already exists. Updating password...');
            const hashedPassword = await hash(password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            });

            await db.user.update({
                where: { email },
                data: { password: hashedPassword }
            });

            console.log('✅ Admin password updated successfully!');
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        // Create admin user
        const admin = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
