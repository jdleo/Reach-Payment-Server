const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const express = require('express');
const router = express.Router();

//set api version
stripe.setApiVersion("2019-05-16");

//root
router.get('/', (req, res) => {
  res.send('api/brands endpoint');
});

//for generating ephemeral key for customer
router.post('/me/ephemeral_keys/', async (req, res, next) => {
  stripe.ephemeralKeys.create(
    {customer: req.headers['customer_id']},
    {stripe_version: "2019-05-16"}
  ).then((key) => {
    res.status(200).json(key);
  }).catch((err) => {
  	//console.log(err.message);
    res.status(500).end();
  });
});

//for generating customer object in Stripe
router.post('/me/create', async (req, res, next) => {
  try {
    stripe.customers.create({
	  email: req.headers['email']
	}, function(err, customer) {
	  // asynchronously called
	  if (err) {
	  	//console.log(err);
	  	res.sendStatus(500);
	  } else {
	  	res.send(customer.id);
	  }
	});
  } catch (err) {
    res.sendStatus(500);
    next(`Error creating customer object: ${err.message}`);
  }
});



module.exports = router;