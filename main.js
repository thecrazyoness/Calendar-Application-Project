const monthYearElement = document.getElementById('monthYear'); // Displays the current month and year
const datesElement = document.getElementById('dates'); // Container for calendar dates
const prevBtn = document.getElementById('prevBtn'); // Button to navigate to the previous month
const nextBtn = document.getElementById('nextBtn'); // Button to navigate to the next month

// Modal Elements (Used for event booking)
const bookingModal = document.getElementById('bookingModal'); // Modal window for booking events
const closeModal = document.querySelector('.close'); // Close button for the modal
const confirmBooking = document.getElementById('confirmBooking'); // Button to confirm an event booking
const selectedDateText = document.getElementById('selectedDateText'); // Displays the selected date inside the modal
const eventNameInput = document.getElementById('eventName'); // Input field for event name
const eventLocationInput = document.getElementById('eventLocation'); // Input field for event location
const startDateTimeInput = document.getElementById('startDateTime'); // Input field for event start date/time
const endDateTimeInput = document.getElementById('endDateTime'); // Input field for event end date/time
const recurringSelect = document.getElementById('recurring'); // Dropdown to select recurrence options (daily, weekly, etc.)
const alert1Select = document.getElementById('alert1'); // First alert time before event
const alert2Select = document.getElementById('alert2'); // Second alert time before event
const alert2Label = document.getElementById('alert2Label'); // Label for the second alert (shown/hidden based on selection)

let currentDate = new Date(); // Stores the current date (used for generating the calendar)
let selectedDate = null; // Stores the date the user selects for booking
let startDateTime = null; // Stores the start date/time of an event
let endDateTime = null; // Stores the end date/time of an event
let appointments = {}; // Object to store event details
let bookedDates = JSON.parse(localStorage.getItem('bookedDates')) || {}; // Retrieve saved events from localStorage, or initialize an empty object


// Load saved appointments on page load
const loadAppointments = () => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
    }

    const storedStartDate = localStorage.getItem('startDateTime');
    if (storedStartDate) {
        startDateTime = storedStartDate;
    }

    const storedEndDate = localStorage.getItem('endDateTime');
    if (storedEndDate) {
        endDateTime = storedEndDate;	
    }
};

// Save appointments and start/end date to localStorage
const saveAppointments = () => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    if (startDateTime) {
        localStorage.setItem('startDateTime', startDateTime);
    }
    if (endDateTime) {
        localStorage.setItem('endDateTime', endDateTime);
    }
};

// Update the calendar
const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';

    // Previous month's days (inactive)
    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 1 - i);
        datesHTML += `<div class="date inactive" data-date="${prevDate.toISOString()}">${prevDate.getDate()}</div>`;
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dateStr = date.toDateString();
        const bookedClass = appointments[dateStr] ? 'booked' : '';
        const tooltip = appointments[dateStr] ? `Event: ${appointments[dateStr].name}` : '';

        // Highlight start date with a green circle
        const isStart = startDateTime === dateStr ? 'start-highlight' : '';
        // Highlight end date with a red square (only if different from start date)
        const isEnd = endDateTime === dateStr && endDateTime !== startDateTime ? 'end-highlight' : '';



        datesHTML += `<div class="date ${bookedClass} ${isStart} ${isEnd}" data-date="${date.toISOString()}" title="${tooltip}">${i}</div>`;
    }

    // Next month's days (inactive)
    for (let i = 1; i <= 6 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive" data-date="${nextDate.toISOString()}">${nextDate.getDate()}</div>`;
    }

    datesElement.innerHTML = datesHTML;
	

    // Add click event to book appointments
    document.querySelectorAll('.date:not(.inactive)').forEach(dateCell => {
        dateCell.addEventListener('click', (event) => {
            selectedDate = new Date(event.target.getAttribute('data-date')).toDateString();
            selectedDateText.textContent = `Selected Date: ${selectedDate}`;

            // Clear form
            eventNameInput.value = '';
            eventLocationInput.value = '';
            startDateTimeInput.value = '';
            endDateTimeInput.value = '';
            recurringSelect.value = 'none';
            alert1Select.value = 'none';
            alert2Select.value = 'none';
            alert2Select.style.display = 'none';
            alert2Label.style.display = 'none';

            bookingModal.style.display = "block";
        });
    });
};

// Handle Confirm Booking
confirmBooking.addEventListener('click', () => {
    const eventName = eventNameInput.value.trim();
    const eventLocation = eventLocationInput.value.trim();
    const start = startDateTimeInput.value;
    const end = endDateTimeInput.value;
    const recurring = recurringSelect.value;
    const alert1 = alert1Select.value;
    const alert2 = alert2Select.value;

    if (eventName && start && end) {
        const startDay = new Date(start).toDateString(); // Store the event's start date
        const endDay = new Date(end).toDateString(); // Store the event's end date

        // Store event only on the start date, not the clicked date
        appointments[startDay] = {
            name: eventName,
            location: eventLocation,
            start: start,
            end: end,
            recurring: recurring,
            alerts: [alert1, alert2].filter(a => a !== 'none')
        };

        startDateTime = startDay; // Save only the actual event start date
        endDateTime = endDay; // Save the actual event end date
        saveAppointments(); // Save to localStorage
        bookingModal.style.display = "none";
        updateCalendar(); // Refresh calendar to highlight the correct start/end dates
    } else {
        alert("Please fill out all required fields.");
    }
});

// Show Alert 2 only after selecting Alert 1
alert1Select.addEventListener('change', () => {
    if (alert1Select.value !== 'none') {
        alert2Select.style.display = 'block';
        alert2Label.style.display = 'block';
    } else {
        alert2Select.style.display = 'none';
        alert2Label.style.display = 'none';
    }
});

// Close Modal
closeModal.addEventListener('click', () => {
    bookingModal.style.display = "none";
});

// Navigation
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Load saved appointments and update the calendar on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    updateCalendar();
});

confirmBooking.addEventListener('click', () => {
    const eventName = eventNameInput.value.trim();
    const eventLocation = eventLocationInput.value.trim();
    const start = startDateTimeInput.value;
    const end = endDateTimeInput.value;

    if (eventName && start && end) {
        const startDay = new Date(start).toDateString();
        const endDay = new Date(end).toDateString();

        // Ensure storage object exists
        if (!appointments[startDay]) {
            appointments[startDay] = [];
        }

        // Store the appointment
        appointments[startDay].push({
            name: eventName,
            location: eventLocation,
            start,
            end
        });

        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Update UI and close modal
        updateCalendar();
        bookingModal.style.display = "none";
    }
});

window.addEventListener('load', () => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
    }
    updateCalendar();
});

document.addEventListener("DOMContentLoaded", function () {
    const calendarDates = document.querySelectorAll(".date");
    const eventDisplay = document.getElementById("eventDisplay");

    // Load saved events
    let appointments = JSON.parse(localStorage.getItem('appointments')) || {};

    calendarDates.forEach(date => {
        date.addEventListener("mouseover", function () {
            const dateValue = date.dataset.date; // Assuming you have a data-date attribute set
            if (appointments[dateValue]) {
                let eventDetails = `<h3>Events on ${dateValue}</h3><ul>`;
                appointments[dateValue].forEach(event => {
                    eventDetails += `<li><strong>${event.name}</strong> @ ${event.location} <br> ${event.start} - ${event.end}</li>`;
                });
                eventDetails += `</ul>`;

                eventDisplay.innerHTML = eventDetails;
                eventDisplay.style.display = "block";
            }
        });

        date.addEventListener("mouseleave", function () {
            eventDisplay.style.display = "none";
        });
    });
}); 

document.getElementById("confirmBooking").addEventListener("click", function () {
    const selectedDate = document.getElementById("startDateTime").value; // Get selected date
    const reason = document.getElementById("eventName").value.trim(); // Get event name/reason

    if (selectedDate && reason) {
        bookedDates[selectedDate] = reason; // Store date as key and reason as value

        // Save to localStorage for persistence
        localStorage.setItem('bookedDates', JSON.stringify(bookedDates));

        alert(`Booking confirmed for ${selectedDate}: ${reason}`);
    } else {
        alert("Please select a date and enter a reason.");
    }
});

function displayBookedDates() {
    console.log("Booked Dates:");
    for (const [date, reason] of Object.entries(bookedDates)) {
        console.log(`${date}: ${reason}`);
    }
}

// Call the function when needed
displayBookedDates();

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const amPm = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour time to 12-hour format
    hours = hours % 12 || 12; // Converts 0 to 12

    const timeString = `${hours}:${minutes}:${seconds} ${amPm}`;
    document.getElementById("clock").textContent = timeString;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock();

function displaySavedEvents() {
    let bookedDates = JSON.parse(localStorage.getItem("bookedDates")) || {}; 
    let eventsList = document.getElementById("eventsList");

    eventsList.innerHTML = ""; // Clear previous entries

    if (Object.keys(bookedDates).length === 0) {
        eventsList.innerHTML = "<li>No events booked yet.</li>";
        return;
    }

    for (const [date, reason] of Object.entries(bookedDates)) {
        let listItem = document.createElement("li");
        listItem.innerHTML = `<strong>${formatDate(date)}:</strong> ${reason}`;
        eventsList.appendChild(listItem);
    }
}

// Format date to be more readable
function formatDate(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric", 
        hour: "numeric", 
        minute: "numeric", 
        hour12: true 
    });
}

// Load saved events when the page loads
window.addEventListener("load", displaySavedEvents);

