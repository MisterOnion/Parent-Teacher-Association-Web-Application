import "https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js"; //Firebase v8 for Stripe
import "https://www.gstatic.com/firebasejs/8.2.9/firebase-functions.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth,
    signOut, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCKqvYg-2DRnsn5phvpujXl4anpo0Gqud4",
    authDomain: "pta-webapp.firebaseapp.com",
    databaseURL: "https://pta-webapp-default-rtdb.firebaseio.com",
    projectId: "pta-webapp",
    storageBucket: "pta-webapp.appspot.com",
    messagingSenderId: "489016784631",
    appId: "1:489016784631:web:677206f8a16f86262585f2"
  };
// Initialize Firebase
// Unread variables for future use
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

// firebase v8 init
firebase.initializeApp(firebaseConfig);

let donateBtn = null;
let user = null;
let amount_input = null;


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

// export function setDonateBtn(htmlElementId) {
//     donateBtn = document.getElementById(htmlElementId);
//     donateBtn.addEventListener("click", async function () {
//         await donateFundraiser();
//     });
// }

// export function setAmount_input(htmlElementId) {
//     amount_input = document.getElementById(htmlElementId);
// }

// async function donateFundraiser() {
//     let amount = Number(amount_input.value);

//     if (!isNaN(amount) && amount !== "") { // is number/float
//         console.log("donate");
//         // INSERT PAYMENT API THINGS HERE
//     }
//     else{
//         alert("Amount is invalid.\n Please ensure you are entering a number.");
//     }
// }

export async function setUser(user_id) { // CAN USE THIS INSIDE donateFundraiser IF WANT
    const dbref = ref(db); 

    await get(child(dbref, "Users/" + user_id))
        .then((snapshot) => {
            user = {
                name: snapshot.val().Name,
                phoneNum: snapshot.val().PhoneNum,
                email: snapshot.val().Email,
                PTAEmail: snapshot.val().PTAEmail,
                passw: snapshot.val().Passw,
                spouses: snapshot.val().Spouses,
                children: snapshot.val().Children,
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

export async function getFundraiser(fundraiser_id) {
    const dbref = ref(db);
    let fundraiser = null;

    await get(child(dbref, "Fundraisers/" + fundraiser_id))
        .then((snapshot) => {
            fundraiser = {
                title: snapshot.val().Title,
                content: snapshot.val().Content,
                author: snapshot.val().Author,
                PTAemail: snapshot.val().PTAEmail,
                authorid: snapshot.val().userID
            };
        })
        .catch((error) => {
            alert(error);
        });

    return fundraiser;
}

// Timer variable
let timeout= null;

function startTimer(){
  if (timeout !== null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    window.logout();
  },5 * 60 * 1000); // 2 minutes
}

window.onload = startTimer;
document.onmousemove = startTimer;
document.onkeypress = startTimer;
// log out when close tab


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
       
          if (user){
             adminContent.style.display = "block";
          }else{
             adminContent.style.display = "none";
          }
      }else{
          window.location.href = '../../index.html';
          console.log("trouble staying auth while using website");
      }
  });
}
checkAuthentication();