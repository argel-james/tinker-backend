const { getDatabase } = require('firebase-admin/database');
const admin = require('firebase-admin');

// Reference to the Firebase Realtime Database
const database = getDatabase(); // No need to pass 'admin' here

// Function to store data in a specific Firebase path
const storeData = (path, data) => {
  return database.ref(path).push(data);
};

// Function to get data from a specific Firebase path
const getData = (path) => {
  return database.ref(path).once('value').then(snapshot => snapshot.val());
};

// Function to update data in a specific Firebase path
const updateData = (path, data) => {
  return database.ref(path).update(data);
};

// Function to delete data from a specific Firebase path
const deleteData = (path) => {
  return database.ref(path).remove();
};

module.exports = {
  storeData,
  getData,
  updateData,
  deleteData,
};
