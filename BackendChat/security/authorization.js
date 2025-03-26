
const APP_URL = process.env.APP_URL;
const APP_PORT = process.env.APP_URL;

const corsConfig = {
    origin: `${APP_URL}:${APP_PORT}`,
    methods: ['GET', 'POST']
  }

module.exports = corsConfig