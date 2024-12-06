import dotenv from 'dotenv';

dotenv.config();
const CONFIG = {};

CONFIG.ENV = process.env.NODE_ENV || 'development';
CONFIG.PORT = process.env.APP_PORT || '8282';
CONFIG.DB_URL = process.env.MONGO_URI;
CONFIG.API_BASE_URL = process.env.API_BASE_URL;
CONFIG.GST = process.env.GST;
CONFIG.SMTP_HOST = process.env.SMTP_HOST;
CONFIG.SMTP_PORT = process.env.SMTP_PORT;
CONFIG.SMTP_AUTH = { user: process.env.SMTP_AUTH_USER, pass: process.env.SMTP_AUTH_PW };

export default CONFIG;