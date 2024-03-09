import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase ,ref , push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
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
  apiKey: "AIzaSyCoh4L_LEJipxyH8qToXwPnKMdTrH8ti84",
  authDomain: "pta-management-system.firebaseapp.com",
  databaseURL:
  "https://pta-management-system-default-rtdb.firebaseio.com",
  projectId: "pta-management-system",
  storageBucket: "pta-management-system.appspot.com",
  messagingSenderId: "1027180154630",
  appId: "1:1027180154630:web:6abcd486ac75387cf79887", 
  measurementId: "G-E3T30H2NEZ",
  };

// Initialize Firebase
// Unread variables for future use
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app); 


var enterID = document.querySelector("#enterID");
var enterTeacherName = document.querySelector("#enterTeacherName");
var enterAnnouncement = document.querySelector("#enterAnnouncement");

var insertBtn = document.querySelector("#insertBtn");
var updateBtn = document.querySelector("#updateBtn");
var removeBtn = document.querySelector("#removeBtn ");
var findBtn = document.querySelector("#findBtn");

var findID = document.querySelector("#findID");
var findName = document.querySelector("#findName");

// adminContent.style.display ="none";

function displayAnnouncement() {
    document.getElementById("announcementList");
  }

function InsertAnnouncement() {
  set(ref(db, "Announcements/" + enterID.value), {
    Name: enterTeacherName.value,
    // Category: announcementCategory.value,
    Announcement: enterAnnouncement.value,
  })
    .then(() => {
      alert("Announcement added successfully");
    })
    .catch((error) => {
      alert(error);
    });
}

function FindAnnouncment() {
  const dbref = ref(db, "Announcements/" + findID.value);
  get(dbref)
    .then((snapshot) => {
      if (snapshot.exists()) {
        findAnnouncement.innerHTML =
          "Announcement: " + snapshot.val().Announcement;
        findName.innerHTML = "Name: " + snapshot.val().Name;
      } else {
        alert("No data found");
      }
    })
    .catch((error) => {
      alert(error);
    });
}


function UpdateAnnouncment() {
  update(ref(db, "Announcements/" + enterID.value), {
    Announcement: enterAnnouncement.value,
    Name: enterTeacherName.value,
  })
    .then(() => {
      alert("Announcement updated successfully");
    })
    .catch((error) => {
      alert(error);
    });
}

function RemoveAnnouncment() {
  remove(ref(db, "Announcements/" + enterID.value))
    .then(() => {
      alert("Announcement deleted successfully");
    })
    .catch((error) => {
      alert(error);
    });
} 

function FetchAllData() {
  const announcementsRef = ref(db, "Announcements");

  get(announcementsRef).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        let post = childSnapshot.val().Announcement; 
        let name = childSnapshot.val().Name;
        addItemToList(post, name);
      });
    } else {
      console.log("No data available");
    }
  });
}


function addItemToList(post, name) {
  var ul = document.getElementById("list");

  // Create a container div for the announcement
  var announcementContainer = document.createElement("div");
  announcementContainer.classList.add("announcement-box"); // class for styling

  var header = document.createElement("h3");
  var _name = document.createElement("p");
  var _post = document.createElement("p");

  header.innerHTML = "Announcement " + ++postNo;
  _post.innerHTML = "Content: " + post;
  _name.innerHTML = "Name: " + name;

  // Append elements to the container
  announcementContainer.appendChild(header);
  announcementContainer.appendChild(_name);
  announcementContainer.appendChild(_post);

  // Append the container to the list
  ul.appendChild(announcementContainer);
}


var postNo = 0;
window.addEventListener("load", FetchAllData);

insertBtn.addEventListener("click", InsertAnnouncement);
findBtn.addEventListener("click", FindAnnouncment);
updateBtn.addEventListener("click", UpdateAnnouncment);
removeBtn.addEventListener("click", RemoveAnnouncment);



  
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

// Display adminContent for admin and teacher only 
// admin@gmail.com
// uid = MwdLYJG5j9X60Y8OKL7HEILLRxF2
// teacher@gmail.com
// uid = Fer5nc96JCWIljQ8NZY42CcSCTN2

function checkAuthentication() {
  onAuthStateChanged(auth, function(user){
      if (user) {
          const uid = user.uid;
          const allowedUID_1= 'ETxtwxKyToNep7qliyeKjJAzHhl1';
          const allowedUID_2 = 'Fer5nc96JCWIljQ8NZY42CcSCTN2';
          console.log(uid);
          if (uid == allowedUID_1 || uid == allowedUID_2){
             adminContent.style.display = "block";
          }else{
             adminContent.style.display = "none";
          }
      }else{
          window.location.href = '../index.html';
          console.log("trouble staying auth while using website");
      }
  });
}


checkAuthentication();
