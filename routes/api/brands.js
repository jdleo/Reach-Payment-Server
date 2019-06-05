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
    if (req.body.amount && req.body.destination && req.body.source) {
    	//variables
        var amount = parseInt(req.body.amount);
        var destination = req.body.destination;
        var source = req.body.source;
        var fee = 0.06

        if (!isNaN(amount)) {
            //amount is parseable to int, calculate transfer amount
            var amountToDestination = amount / (1 + fee);
            //calculate amount after fees
            var totalFees = amount - amountToDestination;

            console.log(amount, amountToDestination, totalFees);

            try {
                stripe.charges.create({
                    amount: amount,
                    currency: "usd",
                    source: source,
                    transfer_data: {
                        amount: amountToDestination,
                        destination: destination,
                    },
                }).then(function(err, charge) {
                    // asynchronously called
                    if (err) {
                        //console.log(err);
                        res.sendStatus(500);
                    } else {
                        res.status(200).json(charge);
                    }
                });
            } catch (err) {
                res.sendStatus(500);
                next(`Error adding token to customer: ${err.message}`);
            }

        } else {
            res.sendStatus(422);
        }
    } else {
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
                    res.status(200).send(customer.id);
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