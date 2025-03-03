document.addEventListener('DOMContentLoaded', function() {
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get product details
      const productCard = e.target.closest('.product-card');
      const productName = productCard.querySelector('h3').textContent;
      const productPrice = productCard.querySelector('.price').textContent;
      
      // Simulate processing
      const button = e.target.querySelector('button');
      button.disabled = true;
      button.textContent = 'Processing...';

      // Redirect to thank you page with product details
      setTimeout(() => {
        const params = new URLSearchParams({
          product: productName,
          price: productPrice
        });
        window.location.href = `thankyou.html?${params.toString()}`;
      }, 1500);
    });
  }
});