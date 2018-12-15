// config.js
module.exports = {
  routePath: `${__dirname}/routes/`,
  controllerPath: `${__dirname}/controllers/`,
  timezone: 'Asia/Kolkata',
  databaseUri: 'mongodb://localhost:27017',
  databaseOptions: {
    dbName: 'NotesManagement',
    authSource: 'NotesManagement',
    autoReconnect: true,
    keepAlive: 1,
  },
};
