import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import {
    getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update,
    onChildChanged, onChildRemoved, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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
const firestore = getFirestore();

let announcement_textfield = null;
let title_textfield = null;
let postAnnouncementBtn = null;

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

 
export function setPostAnnouncementBtn(htmlElementId, user_id) {
    postAnnouncementBtn = document.getElementById(htmlElementId);
    postAnnouncementBtn.addEventListener("click", () => postAnnouncement(user_id));
}

async function postAnnouncement(user_id) {
    let str_title = title_textfield.value;
    let str_announcementTextfield = announcement_textfield.value;

    let name = await getName(user_id);
    let PTA_email = await getPTAEmail(user_id);

    // date is stored in epoch time
    const dbRef = ref(db, "/Announcements");
    const postRef = push(dbRef);

    await set(postRef, {
        Title: str_title,
        Content: str_announcementTextfield,
        Author: name,
        PTAEmail: PTA_email,
        userID: user_id,
        DateTime: await serverTimestamp(),
    })
        .then(() => {
            alert("Announcement posted successfully");
        })
        .catch((error) => {
            alert(error);
        });

    const addAnnouncementCollection = collection(firestore, 'Announcements');
    await addDoc(addAnnouncementCollection, {
        Title: str_title,
        Content: str_announcementTextfield,
        Author: name,
        PTAEmail: PTA_email,
        userID: user_id,
        DateTime: await serverTimestamp(),
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
    title_textfield.style.width = window.innerWidth * 2 / 4 + "px";
    title_textfield.style.height = window.innerHeight / 30 + "px";
}
export function setAnnouncement_textfield(htmlElementId) {
    announcement_textfield = document.getElementById(htmlElementId);
    announcement_textfield.style.resize = "none";
    announcement_textfield.style.width = window.innerWidth * 2/ 4 + "px";
    announcement_textfield.style.height = window.innerHeight * 2 / 4 + "px";
}
