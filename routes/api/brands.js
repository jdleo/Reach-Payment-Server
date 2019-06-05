const pk = process.env.STRIPE_PRIVATE_KEY;
const stripe = require('stripe')(pk);
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

//set api version
stripe.setApiVersion("2019-05-16");

//root
router.get('/', (req, res) => {
    res.send('api/brands endpoint');
});

//for generating ephemeral key for customer
router.post('/me/ephemeral_keys/', async (req, res, next) => {
    stripe.ephemeralKeys.create({ customer: req.body.customer_id }, { stripe_version: "2019-05-16" }).then((key) => {
        res.status(200).json(key);
    }).catch((err) => {
        //console.log(err.message);
        res.status(500).end();
    });
});

//for creating destination charge
router.post('/charge', async (req, res, next) => {
    if (req.body.amount && req.body.destination && req.body.source && req.body.customer) {
        //variables
        var amount = req.body.amount;
        var destination = req.body.destination;
        var source = req.body.source;
        var customer = req.body.customer;
        var fee = 0.06

        if (!isNaN(amount)) {
            //amount is parseable to int
            amount = parseInt(amount);
            //calculate fees
            var fees = amount * fee;
            //calculate total with fees (parseInt just in case)
            var totalWithFees = parseInt(amount + fees);
            //try to create stripe charge
            try {
                stripe.charges.create({
                    amount: totalWithFees,
                    currency: "usd",
                    source: source,
                    customer: customer,
                    transfer_data: {
                        amount: amount,
                        destination: destination,
                    },
                }).then(function(charge) {
                    //send charge data as json
                    res.status(200).json(charge);
                });
            } catch (err) {
                //send 500
                res.sendStatus(500);
                next(`Error adding token to customer: ${err.message}`);
            }

        } else {
            //send 422
            res.sendStatus(422);
        }
    } else {
        //send 422
        res.sendStatus(422);
    }
});

//for generating customer object in Stripe
router.post('/me/create', async (req, res, next) => {
    //check if email parameter is null
    if (req.body.email) {
        try {
            stripe.customers.create({
                email: req.body.email
            }, function(err, customer) {
                // asynchronously called
                if (err) {
                    //console.log(err);
                    res.sendStatus(500);
                } else {
                    res.status(200).json(customer);
                }
            });
        } catch (err) {
            res.sendStatus(500);
            next(`Error creating customer object: ${err.message}`);
        }
    } else {
        res.sendStatus(422);
    }
});



module.exports = router;