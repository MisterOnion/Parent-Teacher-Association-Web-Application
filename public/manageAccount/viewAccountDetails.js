import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  deleteUser
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

let deleteAccBtn = null;
let user = null;

let userAcc = null;
let admin = null;

let acc_uid = null;

export function setAccId(uid) {
  acc_uid = uid;
}
export function setUserAcc(user) {
  userAcc = user;
}
export function setAdmin(user) {
  admin = user
}

export function setDeleteAccBtn(htmlElementId) {
  deleteAccBtn = document.getElementById(htmlElementId);
  deleteAccBtn.addEventListener("click", async function () {
    await deleteAccount(userAcc, admin);
    window.location.href = "../manageAccount/viewAccount.html";
  });
}

async function deleteAccount(userAcc, admin) {
  await signInWithEmailAndPassword(auth, userAcc.PTAEmail, userAcc.passw)
    .then(async function () {
      let currUser = auth.currentUser;
      await deleteUser(currUser)
        .then(() => {
          remove(ref(db, "Users/" + acc_uid))
            .then(() => {
              alert("Account deleted successfully.");
            })
            .catch((error) => {
              alert(error);
            });
        }).catch((error) => {
          alert(error);
        });
    })
    .catch((error) => {
      alert(error);
    });
  await signInWithEmailAndPassword(auth, admin.PTAEmail, admin.passw);
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
let timeout = null;

function startTimer() {
  if (timeout !== null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    window.logout();
  }, 2 * 60 * 1000); // 2 minutes
}

window.onload = startTimer;
document.onmousemove = startTimer;
document.body.addEventListener('keydown', startTimer);
// log out when close tab

window.logout = function () {
  signOut(auth)
    .then(function () {
      alert("Logout successfully!");
      window.location.href = '../index.html';
    })
    .catch(function (err) {
      alert("Logout Error: " + err)
      console.log(err)
    })
}