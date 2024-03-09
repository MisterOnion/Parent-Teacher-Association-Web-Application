import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
  getAuth, 
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getDatabase(app);

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


// store all user data based on user_id
export async function getUser(user_id) {
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
  
    return user;
}

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

