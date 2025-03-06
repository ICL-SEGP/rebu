const express = require('express');
const stripe = require('stripe')('your_stripe_secret_key');
const app = express();

app.use(express.static('.'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: req.body.productName,
          },
          unit_amount: req.body.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/thankyou.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/purchase.html`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));