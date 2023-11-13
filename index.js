import express from 'express';
import axios from 'axios';
import twilio from 'twilio';
import dotenv from 'dotenv';

/** Pseudocode for Getting Weather for Tomorrow on Phone and Web */

// 1. [x] Start this express server
// 2. [x] Set up EJS
// 3. [x] Fetch Daily Weather Data

// For Web
// 1. [x] Render that Data to EJS

// To Your Phone
// 1. [] Text to Phone if Rainy Day or Snowy Day
// https://www.twilio.com/docs/sms/quickstart

const app = express();
const PORT = 3000;

const cityWeather = {};

async function sendSMS() {
    // check if raining, snowing, cold, or harsh conditions
        // set up twilio client
        // send corresponding message
        // error handling
}

function repackageThreeHours(threeHours) {
    return threeHours.map((interval) => {
        return {
            date: interval.dt_txt.split(' ')[0],
            hour: interval.dt_txt.split(' ')[1],
            temp: interval.main.temp,
            feelsLike: interval.main.feels_like,
            weatherMain: interval.weather['0'].main,
            weatherDescription: interval.weather['0'].description,
        }
    })
}

const fetchWeatherAt = async (city) => {
    const appID = `5900817b3e2ae15215d9e5705ae1c2df`;
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${appID}&units=imperial`;

    try {
        const resp = await axios.get(apiURL);
        cityWeather.cityName = resp.data.city.name; 
        cityWeather.list = threeHoursToDays(resp.data.list);
    } catch (error) {
        console.log(error);
    }
}

function groupThreeHoursByDate(threeHours) {
    let fiveDayInterval = [];
    let prevDate = '';

    threeHours.forEach(interval => {
        if (interval.date !== prevDate) {
            fiveDayInterval.push({
                date: interval.date,
                list: []
            });
            prevDate = interval.date;
        } 
    })
    threeHours.forEach(interval => {
        for (let i = 0; i < fiveDayInterval.length; i++) {
            if (fiveDayInterval[i].date == interval.date) {
                fiveDayInterval[i].list.push(interval);
            }
        }
    });
    
    return fiveDayInterval;
}

function threeHoursToDays(threeHours) {
    const threeHourIntervals = repackageThreeHours(threeHours);
    const days = groupThreeHoursByDate(threeHourIntervals);
    return days;
}

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(async (req, res, next) => {
    let cambridge = {
        lat: 42.373611,
        lon: -71.110558
    };
    await fetchWeatherAt(cambridge);
    next();
})

app.get('/', async (req, res) => {
    await sendSMS();
    res.render('index', { weather: cityWeather });
})

app.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`);
})

// Todo
// add a form in the front end that receive latitude and longitude
// validate latitude and longitude inputs
    // make sure it's a float value
    // ? is it between certain numbers
// send http request to openweather after input is validated, this limits request calls
// add glassmorphism card
// Provide a readme for simple startup
// Share project in Q and A section
// Post to Angela Yu