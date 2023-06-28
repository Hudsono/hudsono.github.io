// https://stackoverflow.com/a/54127122
function changeTimezone(date, ianatz) {

    // suppose the date is 12:00 UTC
    var invdate = new Date(date.toLocaleString('en-US', {
        timeZone: ianatz
    }));

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    var diff = date.getTime() - invdate.getTime();

    // so 12:00 in Toronto is 17:00 UTC
    return new Date(date.getTime() - diff); // needs to substract

}

// E.g.
var here = new Date();
var there = changeTimezone(here, "Australia/Sydney");

console.log(`Here:    ${here.toString()}\nToronto: ${there.toString()}`);


// Fire off tick() once on load to initialise.
minuteUpdate(0);

var lastMinuteUpdate = Date.now();
var lastRealTimeUpdate = Date.now();

// Update the time every 60 seconds.
var minuteInterval = setInterval(minuteTick, 0);

var realTimeInterval = setInterval(realTimeTick, 0);

function minuteTick() {
    var now = Date.now();
    var dt = now - lastMinuteUpdate;
    lastMinuteUpdate = now;

    minuteUpdate(dt / 1000);
}

function realTimeTick() {
    var now = Date.now();
    var dt = now - lastRealTimeUpdate;
    lastRealTimeUpdate = now;

    realTimeUpdate(dt / 1000);
}

// Keep track of the time of day, in hours.
var timeOfDay = 0;

var rainProgressX = 0;
var rainProgressY = 0;

function minuteUpdate(dt) {
    var date = changeTimezone(new Date(), "Australia/Sydney");

    var seconds = date.getSeconds() / 3600;
    var minutes = date.getMinutes() / 60;
    var hours = date.getHours();
    timeOfDay = seconds + minutes + hours;

    //timeOfDay += dt * 2;


    if (timeOfDay >= 24) {
        timeOfDay %= 24;
        ResetLighting();
    }

    //timeOfDay *= 2000;
    //timeOfDay %= 24;

    //console.log(timeOfDay);
    UpdateLighting();
}

function realTimeUpdate(dt) {
    UpdateRain(dt);
}

function UpdateLighting() {
    // Rise is about 5:00 to 7:00.
    UpdateGradient("earl", "rise", 5, 7);

    // Noon is about 7:00 to 9:00.
    UpdateGradient("rise", "noon", 7, 9);

    // Late is about 15:00 to 17:00.
    UpdateGradient("noon", "late", 15, 17);

    // Dark is about 18:00 to 21:00 and 0:00 to 5:00
    UpdateGradient("late", "dark", 18, 21);
}

function ResetLighting() {
    document.getElementById("rise").style.opacity = 0;
    document.getElementById("noon").style.opacity = 0;
    document.getElementById("late").style.opacity = 0;
    document.getElementById("dark").style.opacity = 0;
}

// Transition between two gradients.
function UpdateGradient(transFrom, transTo, timeStart, timeEnd) {
    var opTo = 0;

    if (timeOfDay < timeStart)
        return;
    else if (timeOfDay > timeEnd)
        opTo = 1;
    else
        opTo = (timeOfDay - timeStart) / (timeEnd - timeStart);

    document.getElementById(transTo).style.opacity = opTo;
}


/////////////
// WEATHER //
/////////////

var rainAmount = 0.8;     // ml. How much precipitation.
var thunder = false;    // Is the sky angry?
var temperature = 24;   // Celcius. Determines snow.
var windSpeed = 0;      // Km/h.

function UpdateRain(dt) {
    var rainSpeedX = -400;
    var rainSpeedY =700;
    rainProgressX += dt * rainSpeedX;
    rainProgressY += dt * rainSpeedY;


    document.getElementById("rain").style.backgroundPositionY = rainProgressY + "px";
    document.getElementById("rain").style.backgroundPositionX = rainProgressX + "px";

    document.getElementById("rain2").style.backgroundPositionY = (rainProgressY * 0.7) + "px";
    document.getElementById("rain2").style.backgroundPositionX = (rainProgressX * 1.8) + "px";

    document.getElementById("rain3").style.backgroundPositionY = (rainProgressY * 1.2) + "px";
    document.getElementById("rain3").style.backgroundPositionX = (rainProgressX * 1.5) + "px";

    var skyBrightness = ((timeOfDay) / 12);
    if (timeOfDay > 12)
        skyBrightness += 2 * (1 - skyBrightness);

    skyBrightness += 0.2;
    skyBrightness *= 100;

    document.getElementById("storm").style.filter = "brightness(" + skyBrightness + "%)";
    document.getElementById("storm").style.opacity = rainAmount;
    document.getElementById("rain").style.opacity = rainAmount - 0.4;
    document.getElementById("rain2").style.opacity = rainAmount -0.4;
    document.getElementById("rain3").style.opacity = rainAmount - 0.3;

    var borders = document.getElementsByClassName("postBorder");
    for (let i = 0; i < borders.length; i++) {
        borders[i].style.borderTop = 20 * rainAmount;
        borders[i].style.borderRight = 10 * rainAmount;
    }
}