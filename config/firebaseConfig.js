const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
const emcutiety = require('./emcutiety');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: emcutiety.firebaseUrl, // Replace with your Firebase database URL
});

module.exports = admin;
