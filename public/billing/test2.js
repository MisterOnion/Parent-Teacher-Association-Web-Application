import "https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js"; //Firebase v8 for Stripe
import "https://www.gstatic.com/firebasejs/8.2.9/firebase-functions.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase ,ref  ,child, push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

import {getFunctions, httpsCallable} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-functions.js";
// https://firebase.google.com/docs/web/setup#available-libraries
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

// firebase v8 init
firebase.initializeApp(firebaseConfig);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics();
const auth = getAuth();
const db = getDatabase(app);
const firestore = getFirestore();
const functions = getFunctions();

const createStripeCheckout = firebase.functions().httpsCallable('createStripeCheckout')
const stripe = Stripe('pk_test_51OWuggJlh48HCbEITJEsvi5QszCoYuyWBMZZZgSdIG6rqqzGjPzrB3dO9FXXWP0cqiCWA6Bsdkhs7X8KSlAbWCbf004p04ioIW')

let postCounter = 0;
let selectedPost = null;

const createBillingButton = document.getElementById('create-button');
const deleteBillingButton = document.getElementById('delete-button');

// postCounter record in firebase to prevent new billing posts to replcae the first
async function getAndSetPostCounter() {
  const postCounterRef = ref(db, 'post-counter');
  await onValue(postCounterRef, (snapshot) => {
    postCounter = snapshot.val() || 0;
  });
}
getAndSetPostCounter();

// Function to display a billing post
function displayBillingPost(id, date, content, amount) {
  // Create a new div for the billing post
  const postDiv = document.createElement("div");
  postDiv.id = 'post-' + id;
  
  // Add the billing details to the post
  postDiv.innerHTML = `
    <h3>${date}</h3>

    <p>${content}</p>
    <p class="amount">Amount: ${amount}</p>
    <button class="pay-button" id="pay-button-${id}">Pay</button>
  `;

  // Add an event listener to select the post when clicked
  postDiv.addEventListener('click', function() {
    selectedPost = this;
  });

  // Append the new post to the billing posts div
  document.getElementById("billing-posts").appendChild(postDiv);

  // Add an event listener to the pay button
  document
    .getElementById(`pay-button-${id}`)
    .addEventListener("click", function (event) {
      event.stopPropagation(); 
      alert(`Paying ${amount}`);
      createStripeCheckout({
        paymentType: "School fee",
        amount: amount,
      }).then((response) => {
        const sessionId = response.data.id;
        stripe.redirectToCheckout({ sessionId: sessionId });
      });
    });
}

// Function to get and display billing posts from Firebase
function getAndDisplayBillingPosts() {
  const billingPostsRef = ref(db, 'Billing Posts');
  onValue(billingPostsRef, (snapshot) => {
    const data = snapshot.val();
    for (let id in data) {
      displayBillingPost(id, data[id].date, data[id].content, data[id].amount);
    }
  });
}

getAndDisplayBillingPosts();

// Get user id for storing
let userId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    console.log(userId);
  }
});
// End of get user id for storing

createBillingButton.addEventListener('click', async () => {
  // Get the billing details from the input fields
  const date = document.getElementById("date").value;
  const content = document.getElementById("content").value;
  const amount = document.getElementById("pay-amount").value;

  // Create a new div for the billing post
  const postDiv = document.createElement("div");

  // Add the billing details to the post
  postDiv.innerHTML = `
  <h3>${date}</h3>
  <p>${content}</p>
  <p class="amount">Amount: ${amount}</p>
  <button class="pay-button" id="pay-button-${postCounter}">Pay</button>
  `;

  // Add an event listener to select the post when clicked
  postDiv.addEventListener('click', function() {
    selectedPost = this;
  });

  // Upload the billing details to Firebase RT Database
  const newPostRef = ref(db, 'Billing Posts/' + postCounter);
  await set(newPostRef, {
    userId: userId,
    date: date,
    content: content,
    amount: amount,
  });

  // Upload to billing post detials Firestore 
  const billingPostsCollection = collection(firestore, 'Billing Posts');
  await addDoc(billingPostsCollection, {
    userId: userId,
    date: date,
    content: content,
    amount: amount,
  })

  // Increment post counter in database
  const postCounterRef = ref(db,'post-counter');
  await set(postCounterRef, postCounter + 1);

  postCounter++;

});



deleteBillingButton.addEventListener('click', async () => {
  // Delete the selected post
  if (selectedPost) {
    const postId = selectedPost.id.split('-')[1];

    // Delete the billing details from Firebase
    const postRef = ref(db, 'Billing Posts/' + postId);
    await remove(postRef);

    // Remove the selected post from the DOM
    selectedPost.remove();
    selectedPost = null;

  }
});
