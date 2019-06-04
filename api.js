const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//trust proxy
app.set('trust proxy', true);

//for parsing body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

//root
app.get('/', (req, res) => {
    res.send('Reach API root.');
});

//API routes for brands and influencers (used by mobile app) 
app.use('/api/brands', require('./routes/api/brands'));

//google cloud health check
app.get('/_ah/health', (req, res) => {
    res.type('text').send('ok');
});

const server = app.listen(8080, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Example app listening at http://${host}:${port}`);
});