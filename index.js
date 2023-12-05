const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./secret.json');
const { initializeApp} = require("firebase/app");
const routes = require("./route")

const app = express();
app.use(express.json());
app.use(cors());


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://find-agencies.appspot.com',
});


app.use('/api', routes)



const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
