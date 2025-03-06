// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51QyaDZ2M55vVgxBYd0UrVSgSpjxg3LFkDmU5Nrysi8mSU4bsou1cfa8UdrzjskemMgU22LGmFBCHX8CQn0DNMYV600q1hYUKY7');

document.addEventListener('DOMContentLoaded', function() {
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get product details
      const productCard = e.target.closest('.product-card');
      const productName = productCard.querySelector('h3').textContent;
      const productPrice = productCard.querySelector('.price').textContent;
      
      // Disable the button and show loading state
      const button = e.target.querySelector('button');
      button.disabled = true;
      button.textContent = 'Processing...';

      try {
        // Create a Checkout Session directly with Stripe
        const { error } = await stripe.redirectToCheckout({
          lineItems: [{
            price: 'price_1Qyb7F2M55vVgxBY817RX4c8', // Your actual Price ID
            quantity: 1,
          }],
          mode: 'payment',
          successUrl: `http://localhost:8000/thankyou.html?product=Premium%20Headphones&price=199.99`,
          cancelUrl: `http://localhost:8000//purchase.html`,
        });

        

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Payment failed: ' + error.message);
        button.disabled = false;
        button.textContent = 'Buy Now';
      }
    });
  }
});