import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";



function TherapistDashboard() {

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]); // for marking days
  const [showPatientsList, setShowPatientsList] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
  name: '',
  date: '',
  time: '',
  description: '',
  email: '',
  contact: ''
});

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth(); // 0-indexed (0 = January)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const formatDateOnly = (d) => new Date(d).toISOString().split("T")[0];


  const fetchAppointmentsForMonth = () => {
    const monthStr = (currentMonth + 1).toString().padStart(2, "0");
    const yearStr = currentYear.toString();

    axios
      .get(`http://localhost:8000/api/appointments/month?year=${yearStr}&month=${monthStr}`)
      .then((res) => {
        setAppointments(res.data); // each item should have a `date` field (yyyy-mm-dd)
      })
      .catch((err) => console.error("Monthly fetch error:", err));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };
 

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split("T")[0]; // yyyy-mm-dd
    
    axios
      .get(`http://localhost:8000/api/appointments?date=${dateStr}`)
      .then((res) => setPatients(res.data))
      .catch((err) => console.error("Fetch error:", err));
      
      fetchAppointmentsForMonth();

  }, [selectedDate]);
  
  const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };
  const appointmentDates = appointments.map((a) => formatDate(a.date));

  const addAppointment = () => {
  if (!newAppointment.name || !newAppointment.date || !newAppointment.time) {
    alert("Please fill all fields");
    return;
  };

  axios.post('http://localhost:8000/api/appointments/add', newAppointment)
    .then(() => {
      alert("Appointment added!");
      setNewAppointment({ name: '', date: '', time: '', description: '', email: '', contact: '' });
      fetchAppointmentsForMonth(); // Refresh calendar dots
    })
    .catch(err => console.error("Add error:", err));
  };

  const updateAppointmentTime = (name, newTime) => {
  const dateStr = selectedDate.toISOString().split("T")[0];

  axios.post("http://localhost:8000/api/appointments/update", {
    name,
    date: dateStr,
    time: newTime
  })
  .then(() => {
    fetchAppointmentsForMonth(); // Refresh calendar dots
    axios.get(`http://localhost:8000/api/appointments?date=${dateStr}`)
      .then(res => setPatients(res.data));
  })
  .catch(err => console.error("Update error:", err));
};

  const fetchAllAppointments = () => {
  axios.get("http://localhost:8000/api/appointments")
    .then(res => {
      const data = res.data;
      // Extract unique patient names
      const uniquePatients = [...new Map(data.map(p => [p.name, p])).values()];
      setAllPatients(uniquePatients);
    })
    .catch(err => console.error("Error fetching all patients", err));
};
  
const [allPatients, setAllPatients] = useState([]);

  const clearCalendar = () => {
  axios.post("http://localhost:8000/api/appointments/reset")
    .then(() => {
      alert("All appointments cleared!");
      setAppointments([]);
      setPatients([]);
    });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar-buttons">
  <button className="sidebar-button" onClick={clearCalendar}>
    🗓 Clear Calendar
  </button>
  <button className="sidebar-button" onClick={() => {
  setShowPatientsList(!showPatientsList);
  if (!showPatientsList) fetchAllAppointments();
}}>
  👥 My Patients
</button>
  <button className="sidebar-button">
    🚪 Log out
  </button>
</div>


      <main className="main-content">
        <div className="header">
          <img src="/penguin.png" alt="Penguin" className="penguin" />
          <p>Hey <strong>“Therapist Name”</strong>, which patient are you tending to today?</p>
        </div>
       
        <div className="appointment-form">
         <h4>Add Appointment</h4>
         <input type="text" placeholder="Patient Name"
         value={newAppointment.name}
         onChange={(e) => setNewAppointment({ ...newAppointment, name: e.target.value })} />
  <input type="date"
    value={newAppointment.date}
    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
  />
  <input type="time"
    value={newAppointment.time}
    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
  />
  <input type="text" placeholder="Description"
    value={newAppointment.description}
    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
  />
  <input
  type="email"
  placeholder="Email"
  value={newAppointment.email}
  onChange={(e) => setNewAppointment({ ...newAppointment, email: e.target.value })}
/>

<input
  type="tel"
  placeholder="Contact Number"
  value={newAppointment.contact}
  onChange={(e) => setNewAppointment({ ...newAppointment, contact: e.target.value })}
/>

  <button className="slot" onClick={addAppointment}> Submit</button>
</div>
        <div className="appointment-card">
          <div className="slots-section">
            <p>{new Date(selectedDate).toDateString()}</p>
            {patients.length === 0 ? (
              <p>No appointments scheduled.</p>
            ): (
              patients.filter(p => p.date === formatDateOnly(selectedDate))
              .map((p, i) => (
                <div key={i} className="patient-info">
                  <div className="avatar-placeholder"></div>
                  <h3>{p.name}</h3>
                  <p>🟢 {p.status || "Active"}</p>
                  <p>{p.description}</p>
                  <p>📅 {new Date(p.date).toDateString()}</p>
                  <p>⏰ {p.time}</p>
                  <p>📧 {p.email || "Not provided"}</p>
                  <p>📞 {p.contact || "Not provided"}</p>
                  <p>👤 Patient Information</p>
                </div>
              ))
            )}
          </div>
          
          {showPatientsList && (
          <div className="patient-list">
            <h4>All Patients</h4>
            {allPatients.length === 0 ? (
              <p>No patients found.</p>
            ) : (
              allPatients.map((p, i) => (
                <div key={i} className="patient-info">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <p>📅 {p.date}</p>
                  <p>⏰ {p.time}</p>
                </div>
              ))
            )}
          </div>
        )}

          <div className="calendar-section">
            <h4>Your Appointments</h4>
            <div className="calendar-nav">
              <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))}>◀</button>
              <p className="month-label">
                {selectedDate.toLocaleString("default", { month: "long" })} {currentYear}
              </p>
              <button onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))}>▶</button>
            </div>

            <div className="calendar-grid">
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayDate = new Date(currentYear, currentMonth, day);
                const dateStr = formatDate(dayDate);

                const hasAppointment = appointmentDates.includes(dateStr);
                const isSelected =
                  selectedDate.getDate()  === day &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getFullYear() === currentYear;

              return (
                <div
                  key={day}
                  
                  className={`calendar-day
                    ${isSelected ? "selected-day" : ""}
                    ${hasAppointment ? "has-appointment" : ""}
                  `}

                  onClick={() => handleDateClick(day)}
                  >
                  {day}
                </div>
              );
            })}
            </div>
          </div>
            

          <div className="slots-section">
            <p>
              {selectedDate.toDateString()}
            </p>
            {["6:30 PM", "7:30 PM", "8:30 PM", "9:30 PM"].map((slotTime, index) => {
              const selected = patients[0]?.time === slotTime;
            
              return (
              <button
              key={index}
              className={`slot ${selected ? "selected" : ""}`}
              onClick={() =>
                patients.length > 0 &&
                updateAppointmentTime(patients[0].name, slotTime)
              }
              >
                {slotTime}
                </button>
                );
              })}
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default TherapistDashboard;