const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const express = require('express');
const router = express.Router();

router.post('/me/ephemeral_keys/:customerId', async (req, res, next) => {
  const apiVersion = req.body['api_version'];
  try {
    //respond with ephemeral key
    res.send(req.params);
  } catch (err) {
    res.sendStatus(500);
    next(`Error creating ephemeral key for customer: ${err.message}`);
  }
});

module.exports = router;