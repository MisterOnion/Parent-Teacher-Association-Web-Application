import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
    getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update,
    onChildChanged, onChildRemoved, query, orderByChild, equalTo, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { 
    getAuth,
    signOut,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const firestoredb = getFirestore(app);

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

let ownFundraiser_table = null;

export function setOwnFundraiserTable(htmlElementId) {
    ownFundraiser_table = document.getElementById(htmlElementId);
}

export async function listOwnFundraiser(user_id) {
    const dbRef = ref(db, "Fundraisers");
    const q = query(dbRef, orderByChild("userID"), equalTo(user_id));

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
            for (var i = 0; i < 5; i++) {
                var cell = document.createElement('td');
                var button = document.createElement('button');
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
                        button.textContent = "See Fundraiser Details";
                        button.addEventListener("click", function () {
                            localStorage.setItem("fundraiser_id", childSnapshot.key);
                            window.location.href = "../viewFundraiserDetail/viewFundraiserDetail.html";
                        });
                        cell.appendChild(button);
                        break;
                    case 4:
                        button.textContent = "Archive Fundraiser";
                        button.addEventListener("click", async function () {
                            await archiveFundraiser(childSnapshot.key);
                        });
                        cell.appendChild(button);
                        break;
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        });
    });
    ownFundraiser_table.appendChild(table);
}

async function archiveFundraiser(fundraiser_id) {
    let fundraiser = await getFundraiser(fundraiser_id);

    // date is instantiated 2 times or keep showing 1/1/1970 7:30am
    let date = await getServerDate();
    date = await getServerDate();
    date = date.getTime();

    await setDoc(doc(firestoredb, "Fundraisers", fundraiser_id), {
        title: fundraiser.title,
        content: fundraiser.content,
        author: fundraiser.author,
        PTAemail: fundraiser.PTAemail,
        userid: fundraiser.userid,
        archivedDate: date,
    })
        .then(async () => {
            // Delete the data from realtime db
            const dbRef = ref(db, "Fundraisers/" + fundraiser_id);
            await remove(dbRef)
                .then(() => {
                    alert("Fundraiser archived successfully");
                })
                .catch((error) => {
                    alert(error);
                });
        })
        .catch((error) => {
            alert(error);
        });
}

async function getFundraiser(fundraiser_id) {
    const dbref = ref(db);
    let fundraiser = null;

    await get(child(dbref, "Fundraisers/" + fundraiser_id))
        .then((snapshot) => {
            fundraiser = {
                title: snapshot.val().Title,
                content: snapshot.val().Content,
                author: snapshot.val().Author,
                PTAemail: snapshot.val().PTAEmail,
                userid: snapshot.val().userID
            };
        })
        .catch((error) => {
            alert(error);
        });

    return fundraiser;
}

async function getServerDate() {
    let date = null;

    const servertime = {
        time: await serverTimestamp()
    }

    await update(
        ref(db, "/serverTime"), servertime
    );

    const timeRef = ref(db, "/serverTime");
    await onValue(timeRef, (snapshot) => {
        const serverTime = snapshot.val();
        if (serverTime && serverTime.time) {
            date = new Date(serverTime.time);
        }
    });
    await remove(ref(db, "/serverTime"));
    return date;
}

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