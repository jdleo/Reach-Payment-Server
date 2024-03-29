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

//for retrieving list of payouts
router.post('/me/payouts', async (req, res, next) => {
    if (req.body.account_id) {

        var headers = {
            'Stripe-Account': req.body.account_id
        };

        var options = {
            url: 'https://api.stripe.com/v1/payouts?limit=100',
            headers: headers,
            auth: {
                'user': pk,
                'pass': '',

            }
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                //send body
                res.status(200).json(body);
            } else {
                //send 500
                //console.log(response);
                res.sendStatus(500);
            }
        }

        request(options, callback);
    } else {
        //send 422
        res.sendStatus(422);
    }
});

//for retrieving list of transfers
router.post('/me/transfers', async (req, res, next) => {
    if (req.body.account_id) {
        //try to generate dashboard link
        try {
            stripe.transfers.list({
                limit: 100,
                destination: req.body.account_id
            }, function(err, transfers) {
                // asynchronously called
                if (err) {
                    //send 500
                    res.sendStatus(500);
                } else {
                    //send 200 with json
                    res.status(200).json(transfers);
                }
            });
        } catch (err) {
            //send 500
            res.sendStatus(500);
            next(`Error retrieving transfers: ${err.message}`);
        }
    } else {
        //send 422
        res.sendStatus(422);
    }
});

//for retrieving Connect account balance
router.post('/me/balance', async (req, res, next) => {
    if (req.body.account_id) {
        //try to generate dashboard link
        try {
            stripe.balance.retrieve({
                stripe_account: req.body.account_id
            }, function(err, balance) {
                // asynchronously called
                if (err) {
                    //send 500
                    res.sendStatus(500);
                } else {
                    //send 200 with json
                    res.status(200).json(balance);
                }
            });
        } catch (err) {
            //send 500
            res.sendStatus(500);
            next(`Error generating dashboard link: ${err.message}`);
        }
    } else {
        //send 422
        res.sendStatus(422);
    }
});

//for generating dashboard link (Stripe Express account)
router.post('/me/dashboard', async (req, res, next) => {
    if (req.body.account_id) {
        //try to generate dashboard link
        try {
            stripe.accounts.createLoginLink(
                req.body.account_id,
                function(err, link) {
                    //asynchronously called
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.status(200).json(link);
                    }
                }
            );
        } catch (err) {
            //send 500
            res.sendStatus(500);
            next(`Error generating dashboard link: ${err.message}`);
        }
    } else {
        //send 422
        res.sendStatus(422);
    }
});

//for generating connect id from auth token
router.post('/me/account_id', async (req, res, next) => {
    if (req.body.auth_code) {
        var dataString = `client_secret=${pk}&code=${req.body.auth_code}&grant_type=authorization_code`;

        var options = {
            url: 'https://connect.stripe.com/oauth/token',
            method: 'POST',
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                //send body
                res.status(200).json(body);
            } else {
                //send 500
                //console.log(response);
                res.sendStatus(500);
            }
        }

        request(options, callback);
    } else {
        //send 422
        res.sendStatus(422);
    }
});

module.exports = router;