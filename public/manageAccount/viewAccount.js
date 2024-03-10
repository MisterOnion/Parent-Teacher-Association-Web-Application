import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
    getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved,
    orderByChild, query, equalTo
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

let account_table = null;
let name_input = null;

let searchBtn = null;

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


export function setAccountTable(htmlElementId) {
    account_table = document.getElementById(htmlElementId);
}

export function setName_input(htmlElementId) {
    name_input = document.getElementById(htmlElementId);
}

export function setSearchBtn(htmlElementId) {
    searchBtn = document.getElementById(htmlElementId);
    searchBtn.addEventListener("click", function () {
        searchUserAccount();
    });
}

async function searchUserAccount() {
    account_table.innerHTML = "";

    let str_name = name_input.value;
    str_name = str_name.trimEnd();
    str_name = str_name.trimStart();

    const dbRef = ref(db, "Users");
    const q = query(dbRef, orderByChild("Name"), equalTo(str_name));

    var table = document.createElement('table');

    var headertxt = ["Name", "PTA Email", ""];

    var headRow = document.createElement('tr');
    for (let i = 0; i < headertxt.length; i++) {
        var header = document.createElement('th');
        header.textContent = headertxt[i];
        header.style.textAlign = 'center';
        headRow.appendChild(header);
    }
    table.appendChild(headRow);

    await onValue(q, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var row = document.createElement('tr');
            for (var i = 0; i < 3; i++) {
                var cell = document.createElement('td');
                var button = document.createElement('button');
                button.setAttribute('value', childSnapshot.key);
                button.textContent = "See Account Details";
                switch (i) {
                    case 0:
                        cell.textContent = childSnapshot.val().Name;
                        break;
                    case 1:
                        cell.textContent = childSnapshot.val().PTAEmail;
                        break;
                    case 2:
                        button.addEventListener("click", function () {
                            localStorage.setItem("acc_uid", button.value);
                            window.location.href = "../manageAccount/viewAccountDetails.html";
                        });
                        cell.appendChild(button);
                        break;
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        });
    });
    account_table.appendChild(table);
}

export async function listAllAccount() {
    const dbRef = ref(db, "Users");
    const q = query(dbRef, orderByChild("Name"));

    var table = document.createElement('table');

    var headertxt = ["Name", "PTA Email", ""];

    var headRow = document.createElement('tr');
    for (let i = 0; i < headertxt.length; i++) {
        var header = document.createElement('th');
        header.textContent = headertxt[i];
        header.style.textAlign = 'center';
        headRow.appendChild(header);
    }
    table.appendChild(headRow);

    await onValue(q, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var row = document.createElement('tr');
            for (var i = 0; i < 3; i++) {
                var cell = document.createElement('td');
                var button = document.createElement('button');
                button.setAttribute('value', childSnapshot.key);
                button.textContent = "See Account Details";
                switch (i) {
                    case 0:
                        cell.textContent = childSnapshot.val().Name;
                        break;
                    case 1:
                        cell.textContent = childSnapshot.val().PTAEmail;
                        break;
                    case 2:
                        button.addEventListener("click", function () {
                            localStorage.setItem("acc_uid", button.value);
                            window.location.href = "../manageAccount/viewAccountDetails.html";
                        });
                        cell.appendChild(button);
                        break;
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        });
    });
    account_table.appendChild(table);
}

// Timer variable
let timeout = null;

function startTimer() {
    if (timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        window.logout();
    }, 5 * 60 * 1000); // 2 minutes
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