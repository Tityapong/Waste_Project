

// export default {
//     dialect:'postgresql',
//     schema:'./src/utils/db/schema.ts',
//     out:'./drizzle',

//     dbCredentials:{
//         url:process.env.DATABASE_URL,
//         connectionString:process.env.DATABASE_URL,
//     }
// }
const isProduction = process.env.NODE_ENV === 'production';

export default {
    dialect: 'postgresql',
    schema: './src/utils/db/schema.ts',
    out: './drizzle',

    dbCredentials: {
        url: process.env.DATABASE_URL,
        connectionString: process.env.DATABASE_URL,
    },

    // Optionally load a different driver based on environment
  //  driver: isProduction ? '@neondatabase/serverless' : 'pg',
};
