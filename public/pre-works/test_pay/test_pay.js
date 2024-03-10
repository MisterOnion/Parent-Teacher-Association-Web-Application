 import "https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js";
 import "https://www.gstatic.com/firebasejs/8.2.9/firebase-functions.js";


var firebaseConfig = {
    apiKey: "AIzaSyCoh4L_LEJipxyH8qToXwPnKMdTrH8ti84",
    authDomain: "pta-management-system.firebaseapp.com",
    databaseURL: "https://pta-management-system-default-rtdb.firebaseio.com",
    projectId: "pta-management-system",
    storageBucket: "pta-management-system.appspot.com",
    messagingSenderId: "1027180154630",
    appId: "1:1027180154630:web:6abcd486ac75387cf79887",
    measurementId: "G-E3T30H2NEZ"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const checkoutButton = document.getElementById('checkout-button')
  const createStripeCheckout = firebase.functions().httpsCallable('createStripeCheckout')
  const stripe = Stripe('pk_test_51OWuggJlh48HCbEITJEsvi5QszCoYuyWBMZZZgSdIG6rqqzGjPzrB3dO9FXXWP0cqiCWA6Bsdkhs7X8KSlAbWCbf004p04ioIW')
  
  checkoutButton.addEventListener('click', () => {
    createStripeCheckout()
      .then(response => {
        const sessionId = response.data.id
        stripe.redirectToCheckout({ sessionId: sessionId })
      })
  })