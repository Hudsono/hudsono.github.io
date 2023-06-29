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

    var betterMinutes = (minutes * 60).toString();
    if ((minutes * 60) < 10) {
        betterMinutes = "0" + betterMinutes;
    }
    document.getElementById("clock").innerHTML = hours + ":" + betterMinutes;
}

function realTimeUpdate(dt) {
    if (rainAmount > 0)
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

async function logJSONData() {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-35.28&longitude=149.13&current_weather=true&forecast_days=1&timezone=Australia%2FSydney');
    const jsonData = await response.json();
    //console.log(jsonData);

    var weatherCode = 0;
    weatherCode = jsonData.current_weather.weathercode;
    ParseWeatherCode(weatherCode, jsonData.current_weather.windspeed);
}

logJSONData();


var rainAmount = 0;     // ml. How much precipitation.
var thunder = false;    // Is the sky angry?
var windSpeed = 0;      // Km/h.
var cloudiness = 0;     // How cloudy the sky is.
var weatherStatus = "Clear";    // Human-readable text summary of the weather.

// Parse the given weathercode into a human-readable string and set relevant variables.
function ParseWeatherCode(weatherCode, inWindSpeed) {

    windSpeed = inWindSpeed;
    var flavourSuffix = "";  // Append time of day.
    if (timeOfDay < 5 || timeOfDay > 21)
        flavourSuffix = "tonight";
    else if (timeOfDay < 10)
        flavourSuffix = "this morning";
    else if (timeOfDay < 13)
        flavourSuffix = "today";
    else if (timeOfDay < 17)
        flavourSuffix = "this afternoon";
    else
        flavourSuffix = "this evening";

    // Checks against WMO Weather interpretation codes.
    switch (weatherCode) {
        case 0:
            // Clear sky.
            weatherStatus = "Clear skies";
            break;

        case 1:
            // Mainly clear.
            weatherStatus = "Pretty clear out";
            cloudiness = 0.3;
            break;
        case 2:
            // Partly cloudy.
            weatherStatus = "A bit cloudy";
            cloudiness = 0.6;
            break;
        case 3:
            // Overcast.
            weatherStatus = "Cloudy blanket";
            cloudiness = 1;
            break;

        case 45:
            // Fog.
            weatherStatus = "Foggy";
            break;
        case 48:
            //Depositing rime fog (??).
            weatherStatus = "Frosty fog";
            break;

        case 51:
            // Light drizzle.
            weatherStatus = "A light drizzle";
            rainAmount = 0.2;
            cloudiness = 0.2;
            break;
        case 53:
            // Moderate drizzle.
            weatherStatus = "Some drizzle";
            rainAmount = 0.3;
            cloudiness = 0.2;
            break;
        case 55:
            // Dense drizzle.
            weatherStatus = "Lots of drizzle";
            rainAmount = 0.4;
            cloudiness = 0.3;
            break;

        case 56:
            // Light freezing drizzle.
            weatherStatus = "Pretty cold drizzle";
            rainAmount = 0.2;
            cloudiness = 0.2;
            break;
        case 57:
            // Dense freezing drizzle.
            weatherStatus = "Very cold drizzle";
            rainAmount = 0.4;
            cloudiness = 0.3;
            break;

        case 61:
            // Slight rain.
            weatherStatus = "A little rain";
            rainAmount = 0.5;
            cloudiness = 0.4;
            break;
        case 63:
            // Moderate rain.
            weatherStatus = "Some rain out";
            rainAmount = 0.6;
            cloudiness = 0.6;
            break;
        case 65:
            // Heavy rain.
            weatherStatus = "Cats and dogs out";
            rainAmount = 0.7;
            cloudiness = 1;
            break;

        case 66:
            // Light freezing rain.
            weatherStatus = "Chilly rain";
            rainAmount = 0.5;
            cloudiness = 0.4;
            break;
        case 67:
            // Heavy freezing rain.
            weatherStatus = "Lynxes and foxes out";
            rainAmount = 0.7;
            cloudiness = 1;
            break;

        case 71:
            // Light snowfall.
            weatherStatus = "Calming snow";
            cloudiness = 0.5;
            break;
        case 73:
            // Moderate snowfall.
            weatherStatus = "Some snow out";
            cloudiness = 0.8;
            break;
        case 75:
            // Heavy snowfall.
            weatherStatus = "Snow leopards and wolves out";
            cloudiness = 1;
            break;

        case 77:
            // Snow gains (??).
            weatherStatus = "Snow gains";
            cloudiness = 0.2;
            break;

        case 80:
            // Slight rain showers.
            weatherStatus = "Some showers";
            rainAmount = 0.8;
            cloudiness = 1;
            break;
        case 81:
            // Moderate rain showers.
            weatherStatus = "Showers out";
            rainAmount = 0.9;
            cloudiness = 1;
            break;
        case 82:
            // Violent rain showers.
            weatherStatus = "Maines and great danes out";
            rainAmount = 1;
            cloudiness = 1;
            break;

        case 85:
            // Slight snow showers.
            weatherStatus = "Soft showers";
            rainAmount = 0.7;
            cloudiness = 1;
            break;
        case 86:
            // Heavy snow showers.
            weatherStatus = "Soft-ish showers";
            rainAmount = 0.9;
            cloudiness = 1;
            break;

        case 95:
            // Thunderstorm.
            weatherStatus = "Angry out";
            rainAmount = 1;
            cloudiness = 1;
            thunder = true;
            break;

        case 96:
            // Thunderstorm with slight hail.
            weatherStatus = "Raining coins";
            rainAmount = 1;
            cloudiness = 1;
            thunder = true;
            break;
        case 99:
            // Thunderstorm with heavy hail.
            weatherStatus = "Raining apples";
            rainAmount = 1;
            cloudiness = 1;
            thunder = true;
            break;
    }

    // Update the text.
    document.getElementById("weatherStatus").innerHTML = weatherStatus + " " + flavourSuffix;

    // Update visual fluff.
    var skyBrightness = ((timeOfDay) / 12);
    if (timeOfDay > 12)
        skyBrightness += 2 * (1 - skyBrightness);

    skyBrightness += 0.2;
    skyBrightness *= 100;

    document.getElementById("storm").style.filter = "brightness(" + skyBrightness + "%)";
    document.getElementById("storm").style.opacity = cloudiness;
    document.getElementById("rain").style.opacity = rainAmount - 0.4;
    document.getElementById("rain2").style.opacity = rainAmount - 0.4;
    document.getElementById("rain3").style.opacity = rainAmount - 0.3;

    var borders = document.getElementsByClassName("postBorder");
    for (let i = 0; i < borders.length; i++) {
        borders[i].style.borderTop = 20 * rainAmount;
        borders[i].style.borderRight = 10 * rainAmount;
    }
}

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
}