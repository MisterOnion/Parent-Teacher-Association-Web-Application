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


let ownAnnouncement_table = null;
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

export function getUser() {
    return user;
}

export function setOwnAnnouncementTable(htmlElementId) {
    ownAnnouncement_table = document.getElementById(htmlElementId);
}

export async function listOwnAnnouncement(user_id) {
    const dbRef = ref(db, "Announcements");
    const q = query(dbRef, orderByChild("userID"), equalTo(user_id));

    var table = document.createElement('table');

    var headertxt = ["Title", "Author", "PTA Email", "Date", "Time", "", ""];

    let dateDisplay = { year: 'numeric', month: '2-digit', day: '2-digit' };
    let timeDisplay = { hour12: false, hour: '2-digit', minute: '2-digit' };

    await onValue(q, async (snapshot) => {
        let announcement_list = [];

        // get anouncements and store in reverse order (newest to oldest)
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().userID === user_id) {
                announcement_list.unshift({
                    id: childSnapshot.key,
                    title: childSnapshot.val().Title,
                    content: childSnapshot.val().Content,
                    author: childSnapshot.val().Author,
                    PTAemail: childSnapshot.val().PTAEmail,
                    userid: childSnapshot.val().userID,
                    dateTime: childSnapshot.val().DateTime,
                });
            }
        });

        // create table
        let date = null;
        let time = null;
        let dateTime = null;

        table.innerHTML = "";
        var headRow = document.createElement('tr');
        for (let i = 0; i < headertxt.length; i++) {
            var header = document.createElement('th');
            header.textContent = headertxt[i];
            header.style.textAlign = 'center';
            headRow.appendChild(header);
        }
        table.appendChild(headRow);

        for (var i = 0; i < announcement_list.length; i++) {

            var row = document.createElement('tr');
            let announcement_id = null;

            for (var j = 0; j < 7; j++) {
                var cell = document.createElement('td');
                var button = document.createElement('button');

                dateTime = new Date(announcement_list[i].dateTime);

                switch (j) {
                    case 0:
                        cell.textContent = announcement_list[i].title;
                        break;
                    case 1:
                        cell.textContent = announcement_list[i].author;
                        break;
                    case 2:
                        cell.textContent = announcement_list[i].PTAemail;
                        break;
                    case 3:
                        date = dateTime.toLocaleString('en', dateDisplay);
                        date = date.replace(/,/g, '\t');
                        cell.textContent = date;
                        break;
                    case 4:
                        time = dateTime.toLocaleString('en', timeDisplay);
                        cell.textContent = time;
                        break;
                    case 5:
                        announcement_id = announcement_list[i].id;
                        button.textContent = "See Announcement Details";
                        button.addEventListener("click", function () {
                            localStorage.setItem("announcement_id", announcement_id);
                            window.location.href = "viewAnnouncementDetail.html";
                        });
                        cell.appendChild(button);
                        break;
                    case 6:
                        announcement_id = announcement_list[i].id;
                        button.textContent = "Archive Announcement";
                        button.addEventListener("click", async function () {
                            await archiveAnnouncement(announcement_id);
                        });
                        cell.appendChild(button);
                        break;
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    });

    ownAnnouncement_table.appendChild(table);
}

async function archiveAnnouncement(announcement_id) {
    // Add announcement to archive
    let announcement = await getAnnouncement(announcement_id);

    // date is instantiated 2 times or keep showing 1/1/1970 7:30am
    let date = await getServerDate();
    date = await getServerDate();
    date = date.getTime();

    await setDoc(doc(firestoredb, "Announcements", announcement_id), {
        title: announcement.title,
        content: announcement.content,
        author: announcement.author,
        PTAemail: announcement.PTAemail,
        userid: announcement.userid,
        dateTime: announcement.dateTime,
        archivedDate: date,
    })
        .then(async () => {
            // Delete the data from realtime db
            const dbRef = ref(db, "Announcements/" + announcement_id);
            await remove(dbRef)
                .then(() => {
                    alert("Announcement archived successfully");
                })
                .catch((error) => {
                    alert(error);
                });
        })
        .catch((error) => {
            alert(error);
        });
}

async function getAnnouncement(announcement_id) {
    const dbref = ref(db);
    let announcement = null;

    await get(child(dbref, "Announcements/" + announcement_id))
        .then((snapshot) => {
            announcement = {
                title: snapshot.val().Title,
                content: snapshot.val().Content,
                author: snapshot.val().Author,
                PTAemail: snapshot.val().PTAEmail,
                userid: snapshot.val().userID,
                dateTime: snapshot.val().DateTime,
            };
        })
        .catch((error) => {
            alert(error);
        });

    return announcement;
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