import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getDatabase ,ref , push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


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
// Firebase variables
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

  

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
    done: false, 
  };

  // 3rd: pass into renderRow
  renderRow(obj);
  todoList.push(obj);// web local storage (non-deployable data)
  save();
  
  //call auto-update function
  updateSelectOptions();
  
  // set(ref(db, "Event Calendar/" + obj.id), obj)
  // .then(() => {
  //   alert("Event added successfully");
  // })
  // .catch((error) => {
  //   alert("Adding Event Failed" + error);
  // });

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


function save(){
  let stringified = JSON.stringify(todoList); // make into string for forEach syntax
  localStorage.setItem("todoList", stringified);
}

function load(){
  let retrieved = localStorage.getItem("todoList");
  todoList = JSON.parse(retrieved);
  if(todoList == null) {
      todoList = [];
  }
  
}

function renderRows(){
  todoList.forEach(todoObj => {
      renderRow(todoObj);
  })

}

function renderRow({todo: inputValue, category: inputValue2, id, date, time, done,}){

// add a new row
let table = document.getElementById("todoTable");
let trElem = document.createElement("tr");
table.appendChild(trElem);

// checkbox cell
let checkboxElem = document.createElement("input");
checkboxElem.type = "checkbox";
checkboxElem.addEventListener("click", checkboxClickCallback, false);
checkboxElem.dataset.id = id; // recoginizing data with data-key attribute
let tdElem1 = document.createElement("td");
tdElem1.appendChild(checkboxElem);
trElem.appendChild(tdElem1);

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

// delete cell
let spanElem = document.createElement("span");
spanElem.innerText = "delete";
spanElem.className = "material-icons";
spanElem.addEventListener("click", deleteItem, false);
spanElem.dataset.id = id; // saved deleted cell element
let tdElem4 = document.createElement("td");
tdElem4.appendChild(spanElem);
trElem.appendChild(tdElem4);

// reflect on saved data in local web storage after identifying
console.log(done)
checkboxElem.type = "checkbox";
checkboxElem.checked = done;
if(done){
  trElem.classList.add("strike");
}else{
  trElem.classList.remove("strike");
}
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

async function checkboxClickCallback(){
  trElem.classList.toggle("strike"); // on-off method instead of if-else
  for(let i = 0; i < todoList.length; i++){
    if(todoList[i].id == this.dataset.id)
    todoList[i]["done"] = this.checked
    // Firebase update
    const eventRef = ref(db,"Event Calendar/" + this.dataset.id);
    update(eventRef, {done: this.checked})
    .then(()=>{
      console.log("Event Updated Successfully");
    })
    .catch((error) => {
      console.log("Updating Event Failed", error);
    });
    break;
  }
  save(); // store data into local storage  
}

}
// unique id generator
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

  save(); // save sorting in local web storage

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




