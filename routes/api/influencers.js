const pk = process.env.STRIPE_PRIVATE_KEY;
const stripe = require('stripe')(pk);
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var request = require('request');

//set api version
stripe.setApiVersion("2019-05-16");

//root
router.get('/', (req, res) => {
    res.send('api/influencers endpoint');
});

//for generating customer id from auth token
router.post('/me/account_id/', async (req, res, next) => {
    if (req.body.auth_code) {
        var dataString = `client_secret=${pk}&code=${req.body.auth_code}&grant_type=authorization_code`;

        var options = {
            url: 'https://connect.stripe.com/oauth/token',
            method: 'POST',
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            } else {
                console.log(response);
                res.sendStatus(500);
            }
        }

        request(options, callback);
    } else {
        res.sendStatus(422);
    }
});

module.exports = router;