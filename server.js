const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // use it before requiring app

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
