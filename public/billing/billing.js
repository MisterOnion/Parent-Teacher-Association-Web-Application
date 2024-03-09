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
  apiKey: "your key",
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
const db = getDatabase(app);
const firestore = getFirestore(app);
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
    console.log(postCounter)
  });
}
getAndSetPostCounter();

function displayBillingPost(id, date, content, amount) {
  // create a new div for the billing post
  const postDiv = document.createElement("div");
  postDiv.id = 'post-' + id;
  
  // add the billing details to the post
  postDiv.innerHTML = `
    <h3>${date}</h3>

    <p>${content}</p>
    <p class="amount">Amount: ${amount}</p>
    <button class="pay-button" id="pay-button-${id}">Pay</button>
  `;

  // add an event listener to select the post when clicked
  postDiv.addEventListener('click', function() {
    selectedPost = this;
  });

  // append the new post to the billing posts div
  document.getElementById("billing-posts").appendChild(postDiv);

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

// function to get and display billing posts from Firebase
function getAndDisplayBillingPosts() {
  const billingPostsRef = ref(db, 'Billing Posts');
  onValue(billingPostsRef, (snapshot) => {
    const data = snapshot.val();

    // Convert the data object into an array of posts
    const postsArray = Object.keys(data).map((id) => ({
      id,
      date: data[id].date,
      content: data[id].content,
      amount: data[id].amount,
    }));

    // sort posts by date in descending order
    postsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    // display sorted billing posts
    postsArray.forEach((post) => {
      displayBillingPost(post.id, post.date, post.content, post.amount);
    });
  });
}

getAndDisplayBillingPosts();
// Get user id for storing
let userId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
  }
});
// End of get user id for storing

createBillingButton.addEventListener('click', async (event) => {
  event.preventDefault();
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
  set(newPostRef, {
    userId: userId,
    date: date,
    content: content,
    amount: amount,
  });

  // Increment post counter in database
  const postCounterRef = ref(db,'post-counter');
  set(postCounterRef, postCounter + 1);
  
  postCounter++;

  const billingArchiving = collection(firestore, 'Billing Posts')
  try {
    await addDoc(billingArchiving, {
      userId: userId,
      date: date,
      content: content,
      amount: amount,
    });
    alert('Document archived successfully');
  } catch (error) {
    alert('Error archiving document: ', error);
  }

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
        window.location.href = '../index.html';
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
            console.log(uid)
        }else{
            window.location.href = '../index.html';
            console.log("trouble staying auth while using website");
        }
    });
  }
checkAuthentication();
// End Auth Checker
