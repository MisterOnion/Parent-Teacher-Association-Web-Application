import "https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js"; //Firebase v8 for Stripe
import "https://www.gstatic.com/firebasejs/8.2.9/firebase-functions.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase ,ref  ,child, push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

import {getFunctions, httpsCallable} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-functions.js";
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyCKqvYg-2DRnsn5phvpujXl4anpo0Gqud4",
  authDomain: "pta-webapp.firebaseapp.com",
  databaseURL: "https://pta-webapp-default-rtdb.firebaseio.com",
  projectId: "pta-webapp",
  storageBucket: "pta-webapp.appspot.com",
  messagingSenderId: "489016784631",
  appId: "1:489016784631:web:677206f8a16f86262585f2"
};

// firebase v8 init
firebase.initializeApp(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics();
const auth = getAuth();
const db = getDatabase();
const functions = getFunctions();

// user privilege 
let user = null;
export async function setUser(user_id) { 
  const dbref = ref(db); 

  await get(child(dbref, "Users/" + user_id))
      .then((snapshot) => {
          user = {
              type: snapshot.val().Type
          };
      })
      .catch((error) => {
          alert(error);
      });
}

export function getUser(){
  return user;
}
// end user privilege 



// Display invoice
var invoiceRef = ref(db, 'Invoice');

onValue(invoiceRef, (snapshot) => {
  var invoices = snapshot.val();

   // Convert the invoices object to an array and sort it by paymentTime in descending order
  var sortedInvoices = Object.keys(invoices).map(key => ({...invoices[key], id: key})).sort((a, b) => b.paymentTime - a.paymentTime);

  // Update the HTML
  var invoiceElement = document.querySelector('.invoice-list');
  invoiceElement.innerHTML = '<h2>Invoice</h2>';

  // Loop through each invoice
  for(let invoice of sortedInvoices) {
    let shippingInfoStr = '';
    for(let prop in invoice.shippingInfo) {
      if(prop === 'address' && typeof invoice.shippingInfo[prop] === 'object') {
        // If the property is the address object, iterate over its properties
        let addressStr = '';
        for(let addrProp in invoice.shippingInfo[prop]) {
          addressStr += `${addrProp}: ${invoice.shippingInfo[prop][addrProp]}<br>`;
        }
        shippingInfoStr += `address:<br>${addressStr}`;
      } else {
        shippingInfoStr += `${prop}: ${invoice.shippingInfo[prop]}<br>`;
      }
    }
    invoiceElement.innerHTML += `
      <div class="invoice">
        <h3>Invoice: ${invoice.id}</h3>
        <p>Checkout Session ID: ${invoice.checkoutSessionId}</p>
        <p>Payment Status: ${invoice.paymentStatus}</p>
        <p>Shipping Info: ${shippingInfoStr}</p>
        <p>Amount Total Cents: ${invoice.amountTotalCents}</p>
        <p>Payment Time: ${new Date(invoice.paymentTime * 1000)}</p>
      </div>
    `;
  }
});
// End invoice

// Timer variable
let timeout= null;

function startTimer(){
  if (timeout !== null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    window.logout();
  },5 * 60 * 1000); // 5 minutes
}

window.onload = startTimer;
document.onmousemove = startTimer;
document.body.addEventListener('keydown', startTimer);
// End time variable

// Auth Checker
window.logout = function (){
    signOut(auth) 
    .then(function () {
        alert("Logout successfully!"); 
        window.location.href = '../../index.html';
    })
    .catch(function (err){
        alert("Logout Error: " + err) 
        console.log(err)
    })
}

function checkAuthentication() {
    onAuthStateChanged(auth, function(user){
        if (user) {
            const uid = user.uid;
            console.log(uid);
        }else{
            window.location.href = '../../index.html';
            console.log("trouble staying auth while using website");
        }
    });
  }
checkAuthentication();
// End Auth Checker
