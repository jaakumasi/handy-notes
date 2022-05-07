import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, Route, Routes, Navigate } from 'react-router-dom'
import Login from './Components/Login/Login'
import Notes from './Components/Notes/Notes'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { AnimatePresence } from 'framer-motion/dist/framer-motion'

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();

    // sort notes based on most recent saves
    function sortNotes(notes) {
        let sortedNotes = notes.map(note => {
            let wholeArray = note.createdAt.split(' ');
            let dateArray = wholeArray[0].split('/');
            let timeArray = wholeArray[1].split(':');
            // AM = 0, PM = 1. Notes created at PMs are more recent
            let am_pm;
            if (wholeArray[2] === 'PM') am_pm = 1;
            else am_pm = 0;
            // remove trailing comma from date
            let year = dateArray[2].substring(0, 4);
            // add 12hrs to PM hours that have single hour digits [0-9]
            let hour = timeArray[0];
            if (hour.length === 1 && wholeArray[2] === 'PM') {
                hour = (parseInt(hour) + 12).toString();
                timeArray[0] = hour;
            }
            // prepend a zero to AM hours that are single digits [0-9]
            hour = timeArray[0];
            if (hour.length === 1 && wholeArray[2] === 'AM') {
                hour = '0' + hour;
                timeArray[0] = hour;
            }
            // prepend a zero to months that are single digits [0-9]
            let month = dateArray[0];
            if (month.length === 1) {
                month = '0' + month;
                dateArray[0] = month;
            }
            // prepend a zero to days of the month that are single digits [0-9]
            let date = dateArray[1];
            if (date.length === 1) {
                date = '0' + date;
                dateArray[1] = date;
            }
            // combine year, month, date, AM_PM, hour, minute, second
            note.order = Number.parseInt(year + dateArray[0] + dateArray[1] + am_pm + timeArray[0] + timeArray[1] + timeArray[2]);
            return note;
        });
        // sort the notes in descending order according to the date and time created
        sortedNotes.sort(function (a, b) { return b.order - a.order });
        sortedNotes.map(note => console.log(note.order))
        return sortedNotes;
    }

    function setData(userName, email, notes) {
        let sortedNotes = sortNotes(notes);
        let localSave = {
            userName: userName,
            email: email,
            notes: sortedNotes
        };
        // save localSave object containing user's username, email and notes to local storage
        localStorage.setItem('local save', JSON.stringify(localSave));
        navigate('/notes');
    }

    return (
        <div className='App'>
            <AnimatePresence exitBeforeEnter>
                <Routes location={location} key={location.key}>
                    <Route path='/' element={<Login setData={setData} />} /> {/* login page */}
                    <Route path='/notes' element={<Notes sortNotes={sortNotes} />} />   {/* display notes after login */}
                </Routes>
            </AnimatePresence>
        </div>
    )
}