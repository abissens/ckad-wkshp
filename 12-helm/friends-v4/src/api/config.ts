export const DATABASE_TYPE = Deno.env.get('DATABASE_TYPE') || 'mongo'; // postgres|mongo; default to MongoDB
export const DB_HOST = Deno.env.get('DB_HOST');
export const DB_PORT = parseInt(Deno.env.get('DB_PORT'));
export const DB_DATABASE = Deno.env.get('DB_DATABASE');
export const DB_USER = Deno.env.get('DB_USER');
export const DB_PASSWORD = Deno.env.get('DB_PASSWORD');

