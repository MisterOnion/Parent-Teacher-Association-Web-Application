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
// Unread variables for future use
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

let fundraiser_textfield = null;
let title_textfield = null;
let createFundraiserBtn = null;

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

export function setCreateFundraiserBtn(htmlElementId, user_id){
    createFundraiserBtn = document.getElementById(htmlElementId);
    createFundraiserBtn.addEventListener("click", () => createFundraiser(user_id));
}

async function createFundraiser(user_id){
    let str_title = title_textfield.value;
    let str_fundraiserTextfield = fundraiser_textfield.value;

    let name = await getName(user_id);
    let PTA_email = await getPTAEmail(user_id);

    const dbRef = ref(db, "/Fundraisers");
    const postRef = push(dbRef);
    
    await set(postRef, {
        Title: str_title,
        Content: str_fundraiserTextfield,
        Author: name,
        PTAEmail: PTA_email,
        userID: user_id,
    })
        .then(() => {
            alert("Fundraiser created successfully");
        })
        .catch((error) => {
            alert(error);
        });
    // refresh page
    window.location.reload();
}

async function getName(user_id) {
    const dbref = ref(db);
    let name = null;

    try {
        const snapshot = await get(child(dbref, "Users/" + user_id));
        if (snapshot.exists()) {
            name = snapshot.val().Name;
        }
    } catch (error) {
        alert(error);
    }
    return name;
}

async function getPTAEmail(user_id) {
    const dbref = ref(db);
    let email = null;

    try {
        const snapshot = await get(child(dbref, "Users/" + user_id));
        if (snapshot.exists()) {
            email = snapshot.val().PTAEmail;
        }
    } catch (error) {
        alert(error);
    }
    return email;
}

export function setTitle_textfield(htmlElementId) {
    title_textfield = document.getElementById(htmlElementId);
    title_textfield.style.resize = "none";
    title_textfield.style.width = window.innerWidth * 3 / 4 + "px";
    title_textfield.style.height = window.innerHeight / 30 + "px";
}
export function setFundraiser_textfield(htmlElementId) {
    fundraiser_textfield = document.getElementById(htmlElementId);
    fundraiser_textfield.style.resize = "none";
    fundraiser_textfield.style.width = window.innerWidth * 3 / 4 + "px";
    fundraiser_textfield.style.height = window.innerHeight * 3 / 4 + "px";
}


// Timer variable
let timeout= null;

function startTimer(){
  if (timeout !== null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    window.logout();
  },2 * 60 * 1000); // 2 minutes
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