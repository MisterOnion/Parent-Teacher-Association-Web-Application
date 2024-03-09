import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getDatabase ,ref , child, push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCKqvYg-2DRnsn5phvpujXl4anpo0Gqud4",
  authDomain: "pta-webapp.firebaseapp.com",
  databaseURL: "https://pta-webapp-default-rtdb.firebaseio.com",
  projectId: "pta-webapp",
  storageBucket: "pta-webapp.appspot.com",
  messagingSenderId: "489016784631",
  appId: "1:489016784631:web:677206f8a16f86262585f2"
};
// Firebase variables
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const firestore = getFirestore(app);

const DEFAULT_OPTION = "Choose category"; // naming variable for auto-updated

let inputElem,
    inputElem2,
    dateInput, 
    timeInput,
    addButton,
    sortButton,
    selectElem,
    todoList = [], // array for local storage
    calendar;

getElements();
addListeners();
initCalendar();
// local storage load
load();
renderRows();
updateSelectOptions() // call before object data is loaded

function getElements(){
  inputElem = document.getElementsByTagName("input")[0];
  inputElem2 = document.getElementsByTagName("input")[1];
  dateInput = document.getElementById("dateInput");
  timeInput = document.getElementById("timeInput");
  addButton = document.getElementById("addBtn");
  sortButton = document.getElementById("sortBtn");
  selectElem = document.getElementById("categoryFilter");
}

function addListeners(){
  addButton.addEventListener("click", addEntry, false);
  sortButton.addEventListener("click", sortEntry, false);
  selectElem.addEventListener("change", filterEntries, false);
}

async function addEntry(event){
  // 1st: get input value
  let inputValue = inputElem.value;
  inputElem.value = "";

  let inputValue2 = inputElem2.value;
  inputElem2.value = "";

  let dateValue = dateInput.value;
  dateInput.value ="";

  let timeValue = timeInput.value;
  timeInput.value = "";

  // 2nd: make it into objects
  let obj = {
    id : _uuid(), 
    todo: inputValue,
    category: inputValue2,
    date: dateValue,
    time: timeValue,
  };

  // 3rd: pass into renderRow
  renderRow(obj);
  todoList.push(obj);// web local storage (non-deployable data)
  save();
  //call auto-update function
  updateSelectOptions();
  // For cloud Firestore, only obj data can be stored
  const firestoreRef = collection(firestore, "Event Calendar");
  addDoc(firestoreRef,  obj)
    .then(() => {
      alert("Event Archived to Cloud FireStore")
    })
}

function filterEntries(){
  let selection = selectElem.value;
  // empty table, while keeping first row
  let trElems = document.getElementsByTagName("tr");
  for (let i = trElems.length - 1; i > 0; i--){
    trElems[i].remove();
  }
  // filter duplicate events on calendar and remove non-selected category
  calendar.getEvents().forEach(event => event.remove());

  // loop to-do list array, check category property and render the selected row
  if(selection == DEFAULT_OPTION){
    todoList.forEach(obj => renderRow(obj));
  }else{
    todoList.forEach(obj => {
      if(obj.category == selection){
        renderRow(obj); 
      } 
    });
  }
}

function updateSelectOptions(){
  let options = []; 

  todoList.forEach((obj)=>{ // loop over data array for options selecting
    options.push(obj.category);
  })
  
  // check duplicate
  // convert set to remove duplicates, faster than if-else and include
  let optionsSet = new Set(options); 

  // empty the select  options
  selectElem.innerHTML = "";

  //create default option for category
  let newOptionElem = document.createElement('option');
  newOptionElem.value = DEFAULT_OPTION;
  newOptionElem.innerText = DEFAULT_OPTION;
  selectElem.appendChild(newOptionElem);

  
  // for loop for options due to set
  for (let option of optionsSet){
      let newOptionElem = document.createElement('option');
      newOptionElem.value = option;
      newOptionElem.innerText = option;
      selectElem.appendChild(newOptionElem);
  }
}

// Save todoList to Firebase
async function save() {
  const dbRef = ref(db, "Event Calendar");
  set(dbRef, todoList)
    .then(() => {
      console.log("Data saved successfully.");
    })
    .catch((error) => {
      console.error("Error saving data: ", error);
    });
  
}

// Load todoList from Firebase
function load() {
  const dbRef = ref(db, "Event Calendar");
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      todoList = Object.values(data);
      // Remove exisitng events on calendar before updating
      calendar.removeAllEvents();
      renderRows();
      updateSelectOptions();
    } else {
      todoList = [];
    }
  }, (error) => {
    console.log("Error reading data from firebase: ", error);
  });
}

function renderRows(){
  let table = document.getElementById("todoTable");

  // The first row stays but the rest is deleted to be replaced with new rows of data
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
 
  todoList.forEach(todoObj => {
      renderRow(todoObj);
  })

}

function renderRow({todo: inputValue, category: inputValue2, id, date, time,}){

// add a new row 7
let table = document.getElementById("todoTable");
let trElem = document.createElement("tr");
table.appendChild(trElem);

// date cell 
let dateElem = document.createElement("td");
let dateObj = new Date(date);
let formattedDate = dateObj.toLocaleString("en-GB", {
  // format method
  month: "long", 
  day: "numeric",
  year: "numeric",
}); 

dateElem .innerText = formattedDate;
trElem.appendChild(dateElem);

// time cell
let timeElem = document.createElement("td");
timeElem.innerText = time;
trElem.appendChild(timeElem);

// to-do cell
let tdElem2 = document.createElement("td");
tdElem2.innerText = inputValue;
trElem.appendChild(tdElem2);

// category cell
let tdElem3 = document.createElement("td");
tdElem3.innerText = inputValue2;
tdElem3.className = "categoryCell";
trElem.appendChild(tdElem3);

// delete cell with user privilege

let user;
let user_id = localStorage.getItem("uid");

async function setUserHere(user_id) { 
  const dbref = ref(db); 

  try {
    const snapshot = await get(child(dbref, "Users/" + user_id));
    user = {
      type: snapshot.val().Type
    };
  } catch (error) {
    alert(error);
  }
} 

async function getUserHere(){
  const dbref = ref(db);
  
  try {
    const snapshot = await get(child(dbref, "Users/" + user_id));
    user = {
      type: snapshot.val().Type
    };
  } catch (error) {
    alert(error);
  }
    
  return user;
}

// IIFE (Immediately Invoked Function Expression) to execute async function calls
(async function() {
  await setUserHere(user_id);
  user = await getUserHere();

  // Only create and append the delete button if user is not "Parent"
  if (user.type !== "Parent") {
    let spanElem = document.createElement("span");
    spanElem.innerText = "delete";
    spanElem.className = "material-icons";
    spanElem.addEventListener("click", deleteItem, false);
    spanElem.dataset.id = id; // saved deleted cell element
    let tdElem4 = document.createElement("td");
    tdElem4.appendChild(spanElem);
    trElem.appendChild(tdElem4);
  }
})();


// display event on calendar
addEvent({
  id: id,
  title: inputValue,
  start: date,
});

async function deleteItem(){
    trElem.remove();
    updateSelectOptions();

    for(let i = 0; i < todoList.length; i++){
      if(todoList[i].id == this.dataset.id) // id is stored in spanElem called data
      todoList.splice(i, 1); // i = index elm to rmv; 1 = number of elm to rmv
    }
    save(); 
    // event on calendar remove instantly without refreshing 
    calendar.getEventById(this.dataset.id).remove();

    const eventRef = ref(db, "Event Calendar/" + this.dataset.id);
    remove(eventRef)
    .then(() => {
      alert("Event Deleted Successfully");
    })
    .catch((error) => {
      alert("Deleting Event Failed" + error);
    });
  }
}

// uuid function for deleting prodecure
function _uuid() {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Array parse to sort date in ascending order
function sortEntry(){
  todoList.sort((a, b) => {
    let aDate = Date.parse(a.date);
    let bDate = Date.parse(b.date);
    return aDate - bDate;
  }); 
  // remove exisitn to prevent duplicate
  calendar.removeAllEvents();
  // save(); // save sorting in local web storage

  let trElems = document.getElementsByTagName("tr");
  for (let i = trElems.length - 1; i > 0; i--){
    trElems[i].remove();
  }

  renderRows();
  
}
// FullCalendar API  
// initialize and draw it 1 by 1
function initCalendar(){
  var calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events:[],
  });
  calendar.render();
}
// add events to calendar
function addEvent(event) {
  calendar.addEvent( event );
}

// User priv function
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


