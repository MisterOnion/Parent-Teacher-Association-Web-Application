import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase ,ref , push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

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
            console.log(uid);
        }else{
            window.location.href = '../index.html';
            console.log("trouble staying auth while using website");
        }
    });
  }
checkAuthentication();
