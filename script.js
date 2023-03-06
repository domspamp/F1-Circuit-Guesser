let data = new Array();
let track;

async function Main() {
    await apiRequest();
    rand();
    searchbar();
    addGuess();
}
Main();

//Api Request
async function apiRequest() {
    let requestOptions = {
        method: "GET",
        redirect: "follow",
    };

    let parser, xmlDoc;

    await fetch("http://ergast.com/api/f1/2023/circuits", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(result, "text/xml");
            console.log(xmlDoc);
            //console.log(result);

            let x = xmlDoc.getElementsByTagName("CircuitName");
            let l = xmlDoc.getElementsByTagName("Location");

            for (let i = 0; i < x.length; i++) {
                const info = {
                    trackName: x[i].childNodes[0].nodeValue,
                    lat: l[i].attributes[0].nodeValue,
                    long: l[i].attributes[1].nodeValue,
                };

                data.push(info);
            }
            /*data.forEach(i => {
        console.log(i.trackName + " " + i.lat + " " + i.long);
    }) */
        })
        .catch((error) => console.log("error", error));
}

//Random track choice
function rand() {
    let randNum = Math.floor(Math.random() * data.length);
    console.log(randNum);
    track = data[randNum];
    console.log(track.trackName + " " + track.lat + ":" + track.long);
}

//Search Bar
function searchbar() {
    const searchbar = document.querySelector(".searchbar");

    let currentFocus;

    searchbar.addEventListener("input", function (e) {
        let a,
            b,
            i,
            val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < data.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (
                data[i].trackName.substr(0, val.length).toUpperCase() ==
                val.toUpperCase()
            ) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML =
                    "<strong>" +
                    data[i].trackName.substr(0, val.length) +
                    "</strong>";
                b.innerHTML += data[i].trackName.substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML +=
                    "<input type='hidden' value='" + data[i].trackName + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    searchbar.value =
                        this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    searchbar.addEventListener("keydown", function (e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) {
            //up
            /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        }
        if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = x.length - 1;
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != searchbar) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

//Adding guess to the table
function addGuess() {
    let rowNum = 1;
    let guessForm = document.querySelector("form");

    guessForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let validGuess = false;
        let guessInfo;
        let guess = guessForm.elements["search"].value;
        console.log(guess);

        for (let i of data) {
            if (guess === i.trackName) {
                guessInfo = i;
                validGuess = true;
            }
        }

        if (validGuess) {
            document.getElementById("lastGuess").innerHTML = "Previous Guess: " + guess;


            let info = CalculateInfo(guessInfo);
            const dist = info[0];
            const bearing = info[1];
            console.log(bearing);

            let angle;

            if (bearing >= 45 && bearing < 135) {
                angle = "←";
            }
            else if (bearing >= 135 && bearing < 225) {
                angle = "↓";
            }
            else if (bearing >= 225 && bearing < 315) {
                angle = "→";
            }
            else {
                angle = "↑";
            }

            let row = document.createElement("tr");
            row.id = "row-" + rowNum;
            document.getElementById("guess").append(row);

            let circuit = document.createElement("td");
            circuit.innerHTML = guess;
            document.getElementById("row-" + rowNum).append(circuit);

            let distance = document.createElement("td");
            distance.innerHTML = dist.toFixed(2) + " " + angle;
            document.getElementById("row-" + rowNum).append(distance);

            rowNum++;
        }
        else {
            document.getElementById('lastGuess').innerHTML = "Previous Guess: Invalid";
        }
    });
}

function CalculateInfo(info) {
    const R = 6371e3; // radius of the Earth in meters
  const dLat = (info.lat - track.lat) * Math.PI / 180; // convert latitudes to radians
  const dLon = (info.long - track.long) * Math.PI / 180; // convert longitudes to radians
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(track.lat * Math.PI / 180) * Math.cos(info.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c / 1609.344; // distance in meters
  const y = Math.sin(dLon) * Math.cos(info.lat * Math.PI / 180);
  const x = Math.cos(track.lat * Math.PI / 180) * Math.sin(info.lat* Math.PI / 180) - Math.sin(track.lat * Math.PI / 180) * Math.cos(info.lat * Math.PI / 180) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return [d, (bearing + 360) % 360];
}