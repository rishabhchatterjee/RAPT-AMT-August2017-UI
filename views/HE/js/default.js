firebase.initializeApp(config);

var loggedIn = firebase.database().ref(strategyName + '/loggedIn');
var hitNum = firebase.database().ref(strategyName + '/currentHitNum');
var wholeDatabase = firebase.database().ref(strategyName);

var sectionCompleting;

var sectionSize = 125;

//Functions to log user out if window is closed or goes back
window.onbeforeunload = function(){

    // wholeDatabase.once("value").then(function(snapshot) {
    //        var database = snapshot.val();
    //        // loggedVal = database.loggedIn;

    //        // Object.keys(loggedVal).forEach(function(key) {
    //        //     if (loggedVal[key] == currId) {
    //        //         isLoggedIn = true;
    //        //     }
    //        // });


    //        if (sectionCompleting != null) {
    //        	var currCount = database.completedNow[sectionCompleting]["count"];
    //        	if (currCount != 0) {
    //        		firebase.database().ref('completedNow/'+ sectionCompleting + '/count').set(currCount - 1);
    //        	}
    // 		firebase.database().ref('completedNow/'+ sectionCompleting + '/' + currId).remove();
    //        }

    //    });

    loggedIn.once("value").then(function(snapshot) {
        snapshot.forEach(function(child) {
            if (child.val() == currId) {
                child.ref.remove();
            }
        });
    });
    return null;
};

window.onload = function () {
    if (typeof history.pushState === "function") {
        history.pushState("jibberish", null, null);
        window.onpopstate = function () {
            history.pushState('newjibberish', null, null);
            loggedIn.once("value").then(function(snapshot) {
                snapshot.forEach(function(child) {
                    //Removes user from firebase
                    if (child.val() == currId) {
                        child.ref.remove();
                        window.open("http://" + hostName + ":8000/" + strategyName, "_self");
                    }
                });
            });
        };
    }
}

var tempSection;

function checkLoggedIn() {
    //Ensures that user logged in from home page
    var a = location.href;
    //currId = a.substring(a.indexOf("?")+1);

    currId = a.substring(a.lastIndexOf("?")+1, a.lastIndexOf("~"));
    tempSection = a.substring(a.lastIndexOf("~")+1)
    // wholeDatabase.once("value").then(function(snapshot) {
    //     var database = snapshot.val();
    //     loggedVal = database.loggedIn;

    //     console.log(loggedVal)

    //     Object.keys(loggedVal).forEach(function(key) {
    //         if (loggedVal[key] == currId) {
    //             isLoggedIn = true;
    //         }
    //     });


    //     if (isLoggedIn == false) {
    //         console.log("Not logged in");

    //         if (sectionCompleting != null) {
    //         	var currCount = database.completedNow[sectionCompleting]["count"];
    //         	if (currCount != 0) {
    //         		firebase.database().ref('completedNow/'+ sectionCompleting + '/count').set(currCount - 1);
    //         	}
    // firebase.database().ref('completedNow/'+ sectionCompleting + '/' + currId).remove();
    //         }

    //         window.open("http://localhost:8000", "_self");
    //     }

    // });

    // loggedIn.once("value").then(function(snapshot) {
    //     snapshot.forEach(function(child) {
    //         if (child.val() == currId) {
    //             isLoggedIn = true;
    //         }
    //     });

    //     if (isLoggedIn == false) {
    //         console.log("Not logged in");

    //         window.open("http://localhost:8000", "_self");
    //     }
    // });
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }
    return lines;
}



function findNextSection(database, lookForUser) {
    var allSections = database.completedNow;
    var res = '';
    var done = false;

    var completedList = [];

    if (lookForUser) {
        var fireCompletedList = database.ids[currId].completed;
        Object.keys(fireCompletedList).forEach(function(key) {
            completedList.push(key);
        });
    }

    Object.keys(allSections).forEach(function(key) {
        if (allSections[key]["count"] < 5) {
            if (done == false) {
                res = key;
                done = true;
            }

            if (lookForUser == true && completedList.includes(res)) {
                done = false;
                res = "";
            }
        }
    });

    if (done == true) {
        return res;
    }
    return strategyName + "_1";
}

$(document).ready(function() {

    checkLoggedIn();

    //Updates output log to include the id
    outputLog = {id: currId};

    //$.get("http://localhost:8000/data/D5_S1_Michelina_May102017.csv",
    $.get("http://" + hostName + ":8000/data/" + dialogueFile,
        function(data){
            var x = processData(data);
            //var res = findSocial(x);
            var res = getSentences(x);

            wholeDatabase.once("value").then(function(snapshot) {
                database = snapshot.val();

                var num = database.currentHitNum;

                if (num > numHit) {
                    loggedIn.once("value").then(function(snapshot) {
                        snapshot.forEach(function(child) {
                            //Removes user from firebase
                            if (child.val() == currId) {
                                child.ref.remove();
                                window.open("http://" + hostName + ":8000/" + strategyName, "_self");
                            }
                        });
                    });
                }

                if (database.ids[currId] == null) {


                } else if (database.ids[currId].completed == null) {
                    var update = firebase.database().ref(strategyName + '/ids/' + currId + '/completed/placeHolder');
                    update.set("N/A");
                    sectionCompleting = findNextSection(database, false);
                } else {
                    sectionCompleting = findNextSection(database, true);
                }

                sectionCompleting = tempSection;
                console.log(sectionCompleting);

                var sectionNum = parseInt(sectionCompleting.charAt(sectionCompleting.length - 1)) - 1;

                //document.write("sectionNum: " + sectionNum); //degug

                var section = res[sectionNum];
                if(shortVersion) var section = res[sectionNum].slice(0, 5);
                //section = ['a','b','c'];

                section.unshift("");
                section.unshift("");
                section.unshift("");
                arr = section;

                startLoop();
            });
        });

});

var currId;
var isLoggedIn = false;
var outputLog;
var database;

var should = true;
var counter = 0;
var currElem = 4;
var arrCurrNum = 2;

var arr = ["", "", "", "1","2","3"];
var isStrategy = false;

var arrLog = [];
var firstTime = true;
var allLinesArr = [];


function isEmptyLine(index, indexs) {
    for (var i = 0; i < indexs.length; i++) {
        if (indexs[i]["line"] == index) {
            return true;
        }
    }
    return false;
}

//Creates the list of sentences from the csv filie
function findSocial(data) {
    var res = [];
    var indexs = [];

    //separates based on the sections (S1, T1, etc.)
    for (var i = 0; i < data.length; i++) {
        if (data[i][4] != "") {
            indexs.push({Type: data[i][4], line: i})
        }
    }

    var j = 0;
    var expertAns = [];

    var tempArr = [];
    var arrSD = [];
    for (var i = indexs[0]["line"]; i < data.length; i++) {

        //(j == 150 || i == data.length - 1) Use if you want the last x number less than 150 sentences

        if (j == 125) {
            allLinesArr.push(tempArr);
            expertAns.push(arrSD);
            arrSD = [];
            tempArr = [];
            j = 0;
        }

        if (isEmptyLine(i, indexs) == false) {
            if (data[i][2] != "" || data[i][3] != "") {
                if (data[i][2] != "") {
                    tempArr.push("P1: " + data[i][2]);
                } else {
                    tempArr.push("P2: " + data[i][3]);
                }

                if (data[i][6] == strategyName || data[i][5] == strategyName) {
                    arrSD.push("1");
                } else {
                    arrSD.push("0");
                }
            }
            j++;
        }
    }

    firebase.database().ref(strategyName + '/tempLog').set(expertAns);

    return allLinesArr;

    // //Finds the sentences from the sections and displays if P1 or P2 is talking
    // for (var i = 0; i < indexs.length; i = i + 2) {
    // 	var tempArr = [];
    // 	var arrSD = [];
    // 	for (var j = indexs[i]["line"]; j < indexs[i + 1]["line"]; j++) {
    // 		if (data[j][2] != "" || data[j][3] != "") {
    // 			if (data[j][2] != "") {
    //              tempArr.push("P1: " + data[j][2]);
    //          } else {
    //              tempArr.push("P2: " + data[j][3]);
    //          }

    //          if (data[j][6] == "shouldStrategy" || data[j][5] == "shouldStrategy") {
    //          	arrSD.push("1");
    //          } else {
    //          	arrSD.push("0");
    //          }
    // 		}
    // 	}
    //     //console.log(tempArr)
    // 	//Used to output the expert log
    // 	var tempLog = firebase.database().ref('tempLog');
    // 	if (arrSD[8] == "1") {
    // 		tempLog.set(arrSD);
    // 	}
    // 	res.push(tempArr);
    // }
}


//Creates the list of sentences from the csv filie
function getSentences(data) {
    var tempArr = [];
    var j = 0;
    //iterate all the lines
    for (var i = 0; i < data.length; i++) {
        if (j == sectionSize) {
            //push split section
            allLinesArr.push(tempArr);
            tempArr = [];
            j = 0;
        }
        tempArr.push(data[i][1]);
        j++;
    }
    //firebase.database().ref(strategyName + '/tempLog').set(expertAns);

    return allLinesArr;
}



function startLoop() {
    //Initializes the moving list
    for (var i = 1; i < 7; i++) {
        var highlight = document.getElementById(i.toString());
        highlight.innerHTML =  "<p style = 'color: #343434'>" + arr[i - 1] + '</p>';
    }
    call();
}

function call() {
    var i = 0;
    $(".players > li").each(function () {
        $(this).css("top", i);
        i += 60;
        //Animates the list up
        window.players($(this));
    });
    should = false;
}




//Function called from the interface
function shouldStrategy(val) {
    //Whenever should is set to true, the list will animate up
    should = true;
    isStrategy = val;
}


//Used to generate the random code
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789012345678901234567890123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function finished() {
    var quote = document.getElementById("quote");
    var id = makeid();
    quote.innerHTML = id

    outputLog["arrLog"] = arrLog;
    outputLog["code"] = id;
    outputLog["sectionCompleting"] = sectionCompleting;

    // document.write("outputLog: " + outputLog["arrLog"][0]["sentence"] );
    // document.write("outputLog: " + outputLog["code"] );
    // document.write("outputLog: " + outputLog["sectionCompleting"] );

    //Open modal
    $('#modal1').openModal({
        dismissible: false
    });

    var currCount = database.completedNow[sectionCompleting]["count"];
    firebase.database().ref(strategyName + '/completedNow/'+ sectionCompleting + '/count').set(currCount + 1);
    firebase.database().ref(strategyName + '/completedNow/'+ sectionCompleting + '/' + currId).set(currId);
    firebase.database().ref(strategyName + '/ids/' + currId + '/completed/' + sectionCompleting).set(sectionCompleting);

    hitNum.once("value").then(function(snapshot) {
        hitNum.set(snapshot.val() + 1);
    });

    loggedIn.once("value").then(function(snapshot) {
        snapshot.forEach(function(child) {
            if (child.val() == currId) {
                firebase.database().ref(strategyName + '/output').push(outputLog);
                child.ref.remove();
            }
        });
    });
}


//Handles animation for the list
window.players = function($elem) {
    //When should is set to true, the animation will begin
    if (should == true) {

        var top = parseInt($elem.css("top"));
        var temp = -1 * $('.players > li').height();

        //temp == -22 for this case;
        if(top < -22) {
            top = $('.players').height()
            $elem.css("top", top);
        }

        counter++;
        stopAnimate = false;

        if (counter == 6) {
            var prevElemNum = currElem - 1;
            if (currElem == 1) {
                prevElemNum = 6
            }


            var highlightSentence = arr[arrCurrNum + 1];
            if (highlightSentence == null) {
                highlightSentence = "";
            }

            var prevHighlight = document.getElementById(prevElemNum.toString());
            prevHighlight.innerHTML = '<p id = "' + prevElemNum.toString() + 'yuhh' + '" style = "margin-top:-12px; font-size:22px; color: #343434;">' + arr[arrCurrNum] + '</p>';
            $("#" + prevElemNum.toString() + "yuhh").transition({'font-size': '15px' , 'margin-top':'0px'}, 1000);

            var highlight = document.getElementById(currElem.toString());
            highlight.innerHTML = '<p id = "' + currElem.toString() + 'yuh' + '" style = "font-size:15px; color: #343434;">' + highlightSentence + '</p>';


            var sentence = arr[arrCurrNum];
            var stringSD;

            if (isStrategy) {
                stringSD = strategyName;
            } else {
                stringSD = "Non-" + strategyName;
            }

            if (firstTime) {
                firstTime = false;
            } else {
                arrLog.push({sentence: sentence, strategy: stringSD});
                var bar = document.getElementById("bar");
                bar.style.width = ((arrCurrNum - 2)/(arr.length - 3) * 100) + "%";
            }

            if (arrCurrNum + 1 == arr.length) {
                finished();
                stopAnimate = true;
                return;
            }

            $("#" + currElem.toString() + "yuh").transition({'font-size': '22px', 'margin-top':'-12px', 'background-color': '#ffdd6b', 'padding-top': '0.25rem', 'padding-right': '0.5rem', 'padding-bottom': '0.25rem', 'padding-left': '0.5rem'}, 1000);
            var nextElem = currElem + 2;
            if (nextElem > 6) {
                if (nextElem == 7) {
                    nextElem = 1;
                } else {
                    nextElem = 2;
                }
            }

            var x = document.getElementById(nextElem.toString());
            if (arrCurrNum + 3 >= arr.length) {
                x.innerHTML = "";
            } else {
                x.innerHTML = arr[arrCurrNum + 3];
            }

            arrCurrNum++;
        }
        $elem.animate({ top: (parseInt(top)-60) }, 400, function () {
            if (counter == 6) {
                if (currElem < 6) {
                    currElem++;
                } else {
                    currElem = 1;
                }

                should = false;
                counter = 0;
            }

            if (stopAnimate == true) {
                return;
            } else {
                window.players($(this));
            }
        });
    } else {
        var top = parseInt($elem.css("top"));
        $elem.animate({ top: (parseInt(top)) }, 300, function () {
            window.players($(this));
        });
    }
}