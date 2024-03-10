import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
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

let addAccountBtn = null;
let addChildrenBtn = null;
let removeChildrenBtn = null;
let addSpouseBtn = null;
let removeSpouseBtn = null;

let PTAemail_input = null;
let name_input = null;
let type_intputSelect = null;
let email_input = null;
let phoneNum_input = null;
let passw_input = null;
let spouses_input = null;
let children_input = null;

let spouse_display = null;
let children_display = null;

let spouses_label = null;
let children_label = null;

let spouses = [];
let children = [];



export function setAddAccountBtn(htmlElementId) {
    addAccountBtn = document.querySelector("#".concat(htmlElementId));
    addAccountBtn.addEventListener("click", () => createAccount());
}

export function setAddChildrenBtn(htmlElementId) {
    addChildrenBtn = document.querySelector("#".concat(htmlElementId));
    addChildrenBtn.addEventListener("click", () => addChildren());
}

export function setRemoveChildrenBtn(htmlElementId) {
    removeChildrenBtn = document.querySelector("#".concat(htmlElementId));
    removeChildrenBtn.addEventListener("click", () => removeChildren());
}

export function setAddSpouseBtn(htmlElementId) {
    addSpouseBtn = document.querySelector("#".concat(htmlElementId));
    addSpouseBtn.addEventListener("click", () => addSpouse());
}

export function setRemoveSpouseBtn(htmlElementId) {
    removeSpouseBtn = document.querySelector("#".concat(htmlElementId));
    removeSpouseBtn.addEventListener("click", () => removeSpouse());
}

export function setSpouses_label(htmlElementId) {
    spouses_label = document.getElementById(htmlElementId);
}

export function setChildren_label(htmlElementId) {
    children_label = document.getElementById(htmlElementId);
}

export function setSpouses_display(htmlElementId) {
    spouse_display = document.getElementById(htmlElementId);
}

export function setChildren_display(htmlElementId) {
    children_display = document.getElementById(htmlElementId);
}

export function setPTAemail_input(htmlElementId) {
    PTAemail_input = document.querySelector("#".concat(htmlElementId));
}

export function setName_input(htmlElementId) {
    name_input = document.getElementById(htmlElementId);
}

export function setType_intputSelect(htmlElementId) {
    type_intputSelect = document.getElementById(htmlElementId);
    type_intputSelect.addEventListener("change", hideSpouseChildrenInput);
}

export function setSpouses_inputId(htmlElementId) {
    spouses_input = document.querySelector("#".concat(htmlElementId));
}

export function setChildren_inputId(htmlElementId) {
    children_input = document.querySelector("#".concat(htmlElementId));
}

export function setEmail_inputId(htmlElementId) {
    email_input = document.querySelector("#".concat(htmlElementId));
}

export function setPhoneNum_inputId(htmlElementId) {
    phoneNum_input = document.querySelector("#".concat(htmlElementId));
}

export function setPassw_inputId(htmlElementId) {
    passw_input = document.querySelector("#".concat(htmlElementId));
}

async function createAccount() {
    // convert to string
    let str_name = name_input.value;
    let str_PTAemail = PTAemail_input.value;
    let str_email = email_input.value;
    let str_phoneNum = phoneNum_input.value;
    let str_passw = passw_input.value;
    let str_type = type_intputSelect.options[type_intputSelect.selectedIndex].text;

    let newAcc_uid = null;

    //filter string
    let check_phoneNum = str_phoneNum.replaceAll(/-/g, "");
    let check_name = str_name.replaceAll(/ /g, "");

    // check validity
    if (str_name !== "" && str_email !== "" && str_phoneNum !== "" && str_passw !== "" &&
        /^[a-zA-Z]+$/.test(check_name) && //valid name
        str_passw.length > 5 && // valid  passw lenght or firebase auth rejects it
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(str_PTAemail) && //valid primary email
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(str_email) && //valid secondary email
        /^[0-9]*$/.test(check_phoneNum) && (str_phoneNum.split("-").length - 1) == 2) { //valid phone num

        await createUserWithEmailAndPassword(auth, str_PTAemail, str_passw)
            .then((userCredential) => {
                const user = userCredential.user; 
                newAcc_uid = user.uid;
            })
            .catch((error) => {
                alert(error)
            });

        if (str_type === "Parent") {
            children = children.toString().replaceAll(/,/g, ", ");
            spouses = spouses.toString().replaceAll(/,/g, ", ");

            await set(ref(db, "Users/" + newAcc_uid), {
                Name: str_name,
                PTAEmail: str_PTAemail,
                Email: str_email,
                PhoneNum: str_phoneNum,
                Passw: str_passw,
                Type: str_type,
                Spouses: spouses,
                Children: children,
            })
                .then(() => {
                    alert("New account created successfully.");
                })
                .catch((error) => {
                    alert(error);
                });
            // refresh page
            window.location.reload();
        }
        else {
            await set(ref(db, "Users/" + newAcc_uid), {
                Name: str_name,
                PTAEmail: str_PTAemail,
                Email: str_email,
                PhoneNum: str_phoneNum,
                Passw: str_passw,
                Type: str_type,
            })
                .then(() => {
                    alert("New account created successfully.");
                })
                .catch((error) => {
                    alert(error);
                });
            // refresh page
            window.location.reload();
        }
    }
    else {
        alert("Account contains invalid data." +
            "\nPlease ensure account details entered properly." +
            "\nThere should be at least 6 characters in the password.")
    }
}

function hideSpouseChildrenInput() {
    let str_type = type_intputSelect.options[type_intputSelect.selectedIndex].text;

    if (str_type === "Parent") {
        //make all spouse children input, buttons, labels, display visible
        // all inherit css style of parent when visible
        spouses_input.style.display = "inherit";
        children_input.style.display = "inherit";

        addChildrenBtn.style.display = "inherit";
        removeChildrenBtn.style.display = "inherit";
        addSpouseBtn.style.display = "inherit";
        removeSpouseBtn.style.display = "inherit";

        spouse_display.style.display = "inherit";
        children_display.style.display = "inherit";

        children_label.style.display = "inherit";
        spouses_label.style.display = "inherit";
    }
    else {

        //reset the spouses, children input, display and input field
        spouses = [];
        children = [];

        spouse_display.innerHTML = "";
        children_display.innerHTML = "";

        spouses_input.value = "";
        children_input.value = "";

        //make all spouse children input, buttons, labels, display invisible
        spouses_input.style.display = "none";
        children_input.style.display = "none";

        addChildrenBtn.style.display = "none";
        removeChildrenBtn.style.display = "none";
        addSpouseBtn.style.display = "none";
        removeSpouseBtn.style.display = "none";

        spouse_display.style.display = "none";
        children_display.style.display = "none";

        children_label.style.display = "none";
        spouses_label.style.display = "none";
    }
}

function addChildren() {
    let check_children = children_input.value.replaceAll(/ /g, "");
    let str_children = children_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_children)) {
        if (children[0] === "" || spouses.length < 1) { // no children
            children[0] = str_children;
            children_display.innerHTML = children.toString();
        }
        else if (!children.includes(str_children)) {
            children.push(str_children);
            children_display.innerHTML = children.toString().replaceAll(/,/g, ", ");
        }
    }
    else {
        alert("Invalid children name input.\nPlease ensure there are only letters.")
    }
}

function removeChildren() {
    let check_children = children_input.value.replaceAll(/ /g, "");
    let str_children = children_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_children)) {
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i] === str_children) {
                children.splice(i, 1);
                children_display.innerHTML = children.toString().replaceAll(/,/g, ", ");
            }
        }
    } else {
        alert("Invalid children name input.\nPlease ensure there are only letters.")
    }
}

function addSpouse() {
    let check_spouses = spouses_input.value.replaceAll(/ /g, "");
    let str_spouse = spouses_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_spouses)) {
        if (spouses[0] === "" || spouses.length < 1) { // no spouse
            spouses[0] = str_spouse;
            spouse_display.innerHTML = spouses.toString();
        }
        else if (!spouses.includes(str_spouse)) {
            spouses.push(str_spouse);
            spouse_display.innerHTML = spouses.toString().replaceAll(/,/g, ", ");
        }
    } else {
        alert("Invalid spouse name input.\nPlease ensure there are only letters.")
    }
}

function removeSpouse() {
    let check_spouses = spouses_input.value.replaceAll(/ /g, "");
    let str_spouse = spouses_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_spouses)) {
        for (let i = spouses.length; i >= 0; i--) {
            if (spouses[i] === str_spouse) {
                spouses.splice(i, 1);
                spouse_display.innerHTML = spouses.toString().replaceAll(/,/g, ", ");
            }
        }
    } else {
        alert("Invalid spouse name input.\nPlease ensure there are only letters.")
    }
}