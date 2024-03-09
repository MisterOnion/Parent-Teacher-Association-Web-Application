import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

window.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = sessionStorage.getItem('loggedIn');

  if(isLoggedIn == 'true'){
    // remove session token
    sessionStorage.removeItem('loggedIn');
    signOut(auth) 
  }else{
    return;
  }
})

var email = document.getElementById("email");
var password = document.getElementById("password");
window.login = function(e) {
    e.preventDefault();
    var obj = {
        email: email.value,
        password: password.value,
    };

    signInWithEmailAndPassword(auth, obj.email, obj.password)
    .then(function(success){
        alert("Login successful!")
        var userId = (success.user.uid);
        localStorage.setItem("uid", userId)

        // set session token
        sessionStorage.setItem('loggedIn', 'true');

        console.log(userId)

        window.location.href = './menu2/menu2.html';
    })
    .catch(function(err){
        alert("Login error" + err);
    });

    console.log(obj); 

}

