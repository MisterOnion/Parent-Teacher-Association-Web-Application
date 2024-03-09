
import "https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js"; //Firebase v8 for Stripe
import "https://www.gstatic.com/firebasejs/8.2.9/firebase-functions.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";


const firebaseConfig = { 
    apiKey: "AIzaSyCoh4L_LEJipxyH8qToXwPnKMdTrH8ti84",
    authDomain: "pta-management-system.firebaseapp.com",
    databaseURL:
    "https://pta-management-system-default-rtdb.firebaseio.com",
    projectId: "pta-management-system",
    storageBucket: "pta-management-system.appspot.com",
    messagingSenderId: "1027180154630",
    appId: "1:1027180154630:web:6abcd486ac75387cf79887", 
    measurementId: "G-E3T30H2NEZ", 
    };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

firebase.initializeApp(firebaseConfig);


const createStripeCheckout = firebase.functions().httpsCallable('createStripeCheckout')
const stripe = Stripe('pk_test_51OWuggJlh48HCbEITJEsvi5QszCoYuyWBMZZZgSdIG6rqqzGjPzrB3dO9FXXWP0cqiCWA6Bsdkhs7X8KSlAbWCbf004p04ioIW')

const donateButton = document.getElementById('donate-button');
const donationAmountInput = document.getElementById('donation-amount');


donateButton.addEventListener('click', () => {
    const donationAmount = donationAmountInput.value;
    createStripeCheckout({ paymentType: 'Fundraising', amount: donationAmount })
      .then(response => {
        const sessionId = response.data.id;
        stripe.redirectToCheckout({ sessionId: sessionId });
      });
  });