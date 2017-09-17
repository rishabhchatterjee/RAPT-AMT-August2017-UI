//Firebase authentication
var config = {
    apiKey: "AIzaSyBvFUT-aRzloIDX9rB8IjrNtNeFKVa0_Uw",
    authDomain: "inner-nuance-844.firebaseapp.com",
    databaseURL: "https://inner-nuance-844.firebaseio.com",
    projectId: "inner-nuance-844",
    storageBucket: "inner-nuance-844.appspot.com",
    messagingSenderId: "123683927174"
  };
//Host name
var hostName = "104.197.197.3";
//Strategy name
var strategyName = "HE";
//Full length of dialogue v.s. only 5 sentences
var shortVersion = false;
//Dialogue file
var dialogueFile = "../../../data/inmind_all.csv";
//sentence line num per section
var sectionSize = 130;
//max hit num
var numHit = 10;
//max rater num (5 raters per session)
var maxRaterNum = 3;