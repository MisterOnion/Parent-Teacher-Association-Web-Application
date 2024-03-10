import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
    getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update,
    onChildChanged, onChildRemoved, query,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
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

let fundraiser_table = null;

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


export function setFundraiserTable(htmlElementId) {
    fundraiser_table = document.getElementById(htmlElementId);
}

export async function listFundraiser() {
    const dbRef = ref(db, "Fundraisers");
    const q = query(dbRef);

    var table = document.createElement('table');

    var headertxt = ["Title", "Author", "PTA Email", ""];

    await onValue(q, (snapshot) => {
        table.innerHTML = "";
        var headRow = document.createElement('tr');
        for (let i = 0; i < headertxt.length; i++) {
            var header = document.createElement('th');
            header.textContent = headertxt[i];
            header.style.textAlign = 'center';
            headRow.appendChild(header);
        }
        table.appendChild(headRow);

        snapshot.forEach((childSnapshot) => {
            var row = document.createElement('tr');
            for (var i = 0; i < 4; i++) {
                var cell = document.createElement('td');
                var button = document.createElement('button');
                button.textContent = "See Fundraiser Details";
                switch (i) {
                    case 0:
                        cell.textContent = childSnapshot.val().Title;
                        break;
                    case 1:
                        cell.textContent = childSnapshot.val().Author;
                        break;
                    case 2:
                        cell.textContent = childSnapshot.val().PTAEmail;
                        break;
                    case 3:
                        button.addEventListener("click", function () {
                            localStorage.setItem("fundraiser_id", childSnapshot.key);
                            window.location.href = "./viewFundraiserDetail/viewFundraiserDetail.html";
                        });
                        cell.appendChild(button);
                        break;
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        });
    });
    fundraiser_table.appendChild(table);
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

