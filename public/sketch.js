let socket = io();
let otherHandImage;

let mousePos = { x: 0, y: 0 };
let myId;
let userName;

class Hand {
  constructor(_sid, _x, _y, _name) {
    this.sid = _sid,
      this.x = _x,
      this.y = _y,
      this.name = _name,
      this.h = random(100);

  }

  display() {
    image(otherHandImage, this.x - 100, this.y - 100, 200, 200);

    textSize(14);
    let sWidth = textWidth(this.name);

    noStroke();
    fill(this.h, 80, 80);
    rectMode(CENTER);
    rect(this.x - (sWidth + 20) / 2 + 30, this.y + 100, sWidth + 20, 20, 5);

    fill(100);
    textAlign(CENTER);
    text(this.name, this.x - (sWidth + 20) / 2 + 30, this.y + 105);
  }
}


let otherHandArray = [];
let log = [];

// Connect to the socket
socket.on('connect', function () {
  console.log("======= Socket connected =======");
  myId = socket.id;
  otherHandArray = [];

});

// Preload the image
function preload() {

  otherHandImage = loadImage('assets/other_hand.png');

  soundFormats('mp3');
  mySound = loadSound('assets/clap.mp3');

}

function setup() {
  createCanvas(windowWidth, windowHeight);

  noCursor();

  colorMode(HSB, 100);

  var myUrl = new URL(window.location);
  var searchParams = new URLSearchParams(myUrl.search);
  userName = searchParams.get("userName");
  if (!userName) userName = "Anonymous";

  thisHand = new Hand("", mouseX, mouseY, userName);

  socket.on('allClients', function (allClients) {
    console.log("There is already " + allClients.length + " hands online");
    for (let i = 0; i < allClients.length; i++) {
      let aNewHand = new Hand(allClients[i].sid, allClients[i].x, allClients[i].y, allClients[i].name);
      otherHandArray.push(aNewHand);
    }
    drawOtherHands();
  });

  socket.on('hand', function (hand) {
    let exist = 0;

    for (let i = 0; i < otherHandArray.length; i++) {
      if (hand.sid == otherHandArray[i].sid) {
        // this client already exist
        otherHandArray[i].x = hand.x;
        otherHandArray[i].y = hand.y;
        otherHandArray[i].name = hand.name;
        exist = 1;
        break;
      }
    }
    if (exist == 0) {
      // new come
      log.unshift(new Date().toLocaleString(undefined, { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' }) + ", " + hand.name + "(" + hand.sid + ") comes");

      let aNewHand = new Hand(hand.sid, hand.x, hand.y, hand.name);
      otherHandArray.push(aNewHand);
    }
    console.log(otherHandArray);
  });

  socket.on('clientLeft', function (sid) {

    for (let i = 0; i < otherHandArray.length; i++) {
      if (sid == otherHandArray[i].sid) {
        // this client left
        handName = otherHandArray[i].name;
        otherHandArray.splice(i, 1);

        if (i == clapWith) {
          clapWith = -1;
        }
        break;
      }
    }

    log.unshift(new Date().toLocaleString(undefined, { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' }) + ", " + handName + " (" + sid + ") left");
  });
}

var leftMargin = 20;
var topMargin_Header = 50;
var topMargin_Id = 100;
var topMargin_OnlineCount = 120;
var topMargin_Logs = 160;

var thisHand;

var colorH = 0;
var frameCount = 0;

var clapFlag = 0;
var clapWith = -1;
var holdingTime = 0;

function draw() {

  // Background effects
  frameCount++;

  frameCount % 5 == 1 ? colorH++ : 0;
  colorH = colorH > 100 ? 0 : colorH;
  background(colorH, 4, 100);
  fill(0);

  // Information
  textAlign(LEFT);
  textSize(32);
  text("Welcome " + userName, leftMargin, topMargin_Header);

  textSize(14);
  text("Your id: " + myId, leftMargin, topMargin_Id);
  text("Current online: " + (otherHandArray.length + 1), leftMargin, topMargin_OnlineCount);

  text("10 recent logs: ", leftMargin, topMargin_Logs);
  for (let i = 0; i < 10; i++) {
    text(log[i], leftMargin, topMargin_Logs + 20 + 20 * i);
  }


  if (clapWith == -1) {
    // No one to calp

    // Find one to clap
    for (let i = 0; i < otherHandArray.length; i++) {
      if (dist(mouseX, mouseY, otherHandArray[i].x, otherHandArray[i].y) < 20) {
        // Find someone
        clapWith = i;

        break;
      }
    }
  } else {
    // Already have one to clap, test if still with the one
    if (dist(mouseX, mouseY, otherHandArray[clapWith].x, otherHandArray[clapWith].y) < 20) {
      // Still 
      if (clapFlag) {
        if (millis() - holdingTime < 1000) {
          fill(0, 80, 80);
          circle(mouseX, mouseY, 200);

          fill(0, 80, 80);
          textAlign(LEFT);
          textSize(32);
          text("Yeah!", mouseX + 20, mouseY - 120);
        }
      }

    } else {
      // Not any more, reset everything
      clapFlag = 0;
      clapWith = -1;
      holdingTime = 0;
    }
  }

  // Draw hands
  for (let i = 0; i < otherHandArray.length; i++) {
    otherHandArray[i].display();
  }

  thisHand.x = mouseX;
  thisHand.y = mouseY;
  thisHand.display();
  thisHand.display();
  thisHand.display();
}

function mouseMoved() {
  mousePos = { x: mouseX, y: mouseY, name: userName };
  if (socket.connected) {
    socket.emit('mousePos', mousePos);
  } else {
    console.log("You are offline, please connect again.");
  }
}

function mousePressed() {

  if (clapWith != -1) {
    if (dist(mouseX, mouseY, otherHandArray[clapWith].x, otherHandArray[clapWith].y) < 20) {
      clapFlag = 1;
      holdingTime = millis();
      mySound.play();
    }
  }
}