module.exports = {
    development: {
        POSTGRES_URL: "postgres://default:0oB8nyIZFXeb@ep-orange-mud-98177673-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb",
        POSTGRES_PRISMA_URL: "postgres://default:0oB8nyIZFXeb@ep-orange-mud-98177673-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15",
        POSTGRES_URL_NON_POOLING: "postgres://default:0oB8nyIZFXeb@ep-orange-mud-98177673.us-east-1.postgres.vercel-storage.com:5432/verceldb",
        username: "default",
        host: "ep-orange-mud-98177673-pooler.us-east-1.postgres.vercel-storage.com",
        password: "0oB8nyIZFXeb",
        database: "verceldb",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Add this line to accept self-signed certificates
            },
        },
    }
}