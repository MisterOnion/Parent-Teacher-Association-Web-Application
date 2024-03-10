import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
const firebaseConfig = {
  apiKey: "AIzaSyCKqvYg-2DRnsn5phvpujXl4anpo0Gqud4",
  authDomain: "pta-webapp.firebaseapp.com",
  databaseURL: "https://pta-webapp-default-rtdb.firebaseio.com",
  projectId: "pta-webapp",
  storageBucket: "pta-webapp.appspot.com",
  messagingSenderId: "489016784631",
  appId: "1:489016784631:web:677206f8a16f86262585f2"
};

import { 
  getDatabase,
  ref, 
  get,
  set,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

const db = getDatabase();




var enterEventID = document.querySelector("#enterEventID");
var enterEvent = document.querySelector("#enterEvent");
var enterStartDate = document.querySelector("#enterStartDate");
var enterEndDate = document.querySelector("#enterEndDate");

var insertEvent = document.querySelector("#insertEvent");
var updateEvent = document.querySelector("#updateEvent");
var removeEvent = document.querySelector("#removeEvent");

var findEventID = document.querySelector("#findEventID");
var findEvent = document.querySelector("#foundEvent");  // Fix the ID
var findStartDate = document.querySelector("#foundStartDate");
var findEndDate = document.querySelector("#foundEndDate");




function displayEvent() {
  document.getElementById("eventList");
}

function InsertEvent() {
  set(ref(db, "Events/" + enterEventID.value), {
    Event: enterEvent.value,
    startDate: enterStartDate.value,
    endDate: enterEndDate.value,
  })
    .then(() => {
      alert("Event added successfully");
    })
    .catch((error) => {
      alert(error);
    });
} 


function UpdateEvent() {
  update(ref(db, "Events/" + enterEventID.value), {
    Event: enterEvent.value,
    startDate: enterStartDate.value,
    endDate: enterEndDate.value,
  })
    .then(() => {
      alert("Event updated successfully");
    })
    .catch((error) => {
      alert(error);
    });
}

function RemoveEvent() {
  remove(ref(db, "Events/" + enterEventID.value))
    .then(() => {
      alert("Event deleted successfully");
    })
    .catch((error) => {
      alert(error);
    });
}


function FetchAllData() {
  const eventsRef = ref(database, "Events");

  get(eventsRef).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        let event = childSnapshot.val().Event;
        let start_date = childSnapshot.val().startDate;
        let end_date = childSnapshot.val().endDate;
        addItemToList(event, start_date, end_date);
      });
    } else {
      console.log("No data available");
    }
  });
}

function addItemToList(event, start_date, end_date) {
  var ul = document.getElementById("event-list");
  var header = document.createElement("h3");
  var _name = document.createElement("li");
  // Add a line break
  var lineBreak = document.createElement("br");
  ul.appendChild(lineBreak);
  var _post = document.createElement("li");

  header.innerHTML = "Event " + ++postNo;
  _post.innerHTML = "Event: " + event; // Fix the property name
  _name.innerHTML = "Start Date: " + start_date + ", End Date: " + end_date;

  ul.appendChild(header);
  ul.appendChild(_name);
  ul.appendChild(lineBreak); // Append the line break
  ul.appendChild(_post);
}
var postNo = 0;
window.addEventListener("load", FetchAllData);

insertEvent.addEventListener("click", InsertEvent);
updateEvent.addEventListener("click", UpdateEvent);
removeEvent.addEventListener("click", RemoveEvent);


