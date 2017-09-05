firebase.initializeApp(config);

var currId;
var wholeDatabase = firebase.database().ref(strategyName);
var loggedIn = firebase.database().ref(strategyName + '/loggedIn');
var isLoggedIn = false;
var section;

var questions = ['I suck at math.',
                  'I look good in blue.',
                  'I’m not sure where they went.',
                  'My friend Tom is ugly and he is bad at math.',
                  'I have a big family – there are 7 kids.',
                  'Add five x to both sides of the equation.',
                  'I’m getting better at math.',
                  'What grade are you in?',
                  'I’m just starting seventh grade.',
                  'I think you just type the number there.']

$(document).ready(function() {

    var a = location.href;
    currId = a.substring(a.lastIndexOf("?")+1, a.lastIndexOf("~"));
    section  = a.substring(a.lastIndexOf("~")+1);
    //currId = a.substring(a.indexOf("?")+1);

    loggedIn.once("value").then(function(snapshot) {
        snapshot.forEach(function(child) {
            if (child.val() == currId) {
                isLoggedIn = true;
            }
        });
        
        if (isLoggedIn == false) {
            console.log("Not logged in");
            window.open("http://" + hostName + ":8000/" + strategyName, "_self");
        }
    });


    wholeDatabase.once("value").then(function(snapshot) {
        var database = snapshot.val();

        var correctAnswers = database.correctAns;
        var idAnswers = database.ids[currId].answers;

        var questionsWrong = [];

        for (var i = 0; i < idAnswers.length; i++) {
            if (idAnswers[i] == '0') {
                questionsWrong.push(i);
            }
        }

        for (var i = 0 ; i < questionsWrong.length; i++) {
            var sentence = questions[questionsWrong[i]];
            var type = correctAnswers[questionsWrong[i]];
            addCorrections(sentence, type)
        }
    });
});


var pressedSubmit = false;


window.onbeforeunload = function(){
    loggedIn.once("value").then(function(snapshot) {
        snapshot.forEach(function(child) {
            if (child.val() == currId) {
                if (pressedSubmit == false) {
                    child.ref.remove();
                }
            }
        });
    });
    return null;
};

function submit() {
    window.open("http://" + hostName + ":8000/start.html?" + currId + "~" + section, "_self");
}




function addCorrections(sentence, type) {
  var step = document.createElement("div");
  if (type == 0) {
    step.innerHTML = '<br><h5><font style = "font-weight: 500;">' + sentence + '</font> <font style = "color: green;font-weight: 300;">(Self-Disclosure)</font></h5>';
  } else {
    step.innerHTML = '<br><h5><font style = "font-weight: 500;">' + sentence + '</font> <font style = "color: red;font-weight: 300;">(Non-Self-Disclosure)</font></h5>';
  }

  var filler = document.getElementById("filler");
  var main = document.getElementById("main");

  main.insertBefore(step, filler);
}
    