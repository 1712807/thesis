const express = require('express');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.use('', require('./api/admin/deals'));
app.use('', require('./api/admin/comments'));
app.use('', require('./api/admin/users'));

app.use('', require('./api/auth'));
app.use('', require('./api/users'));

app.use('', require('./api/deals'));
app.use('', require('./api/comments'));
app.use('', require('./api/deal_reactions'));

// require('./api/auth')(app);
// require('./api/user')(app);

app.listen(5000, () => console.log(`Listening on port 5000`));