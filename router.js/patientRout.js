const express = require('express');
const router = express.Router();


const {signUp, verify, login, forgotpassWord, resetpassword,updateProfile, uploadProfilePicture, deleteProfilePicture,
     getAllHospitals, logOut, getOneHospital, searchHospital, getOnePatient, confirmPayment
}= require ("../controllers/patientControls");
const {authenticate, admin} = require ("../middleware/authentication");
const { rescheduleAppointment } = require('../controllers/appointment');

router.post("/register", signUp);
//router.post("/verify/:id/:token", verify);


router.put("/uploadimage", authenticate, uploadProfilePicture);
router.delete("/deleteimage", authenticate, deleteProfilePicture);
router.get("/all-hospitals", authenticate, getAllHospitals)
router.get("/one-hospital/:Id", authenticate, getOneHospital)
router.put("/update-profile/:userId", authenticate, updateProfile)
router.get("/get-one-user", authenticate, getOnePatient)
router.get('/hospitals-search',authenticate, searchHospital)
router.post('/confirm-payment', authenticate, confirmPayment)
router.get("/verify/:id/:token",verify);
router.post("/login", login);
router.post("/forgot", forgotpassWord);
router.put("/reset/:id", resetpassword);
router.put('/logout',authenticate, logOut);

module.exports = router


























// const express = require('express');

// const { signUp, verify, login, getAllHospitals, forgotpassWord, resetpassword, logOut, uploadProfilePicture, deleteProfilePicture, } = require("../controllers/userControl");

// const {
//     register, verifyAdmin, loginAdmin, makeAdmin, forgotpassWordAdmin, resetpasswordAdmin, uploadProfilePictureAdmin, deleteProfilePictureAdmin, logOutAdmin,
// }= require("../controllers/adminControl")


// const { handleAppointmentRequest, getAllRequest, viewOneAppointRequest, deleteRequest, requestAppointment, sendAppointmentReminders, cancelAppointment, rescheduleAppointment, } = require("../controllers/appointment")

// const message = require("../controllers/messageController")

// const {authenticate, admin} = require("../middleware/authentication");

// const router = express.Router();

// router.post("/register", signUp);

// //Sign up as a hospital
// router.post("/sign-up", register);


// router.put("/uploadimage", authenticate, uploadProfilePicture);

// router.delete("/deleteimage", authenticate, deleteProfilePicture);

// router.get("/all-hospitals", getAllHospitals)

// router.get("/verify/:id/:token", verify);

// router.post("/login", login);

// router.post("/forgot", authenticate, forgotpassWord);

// router.put("/reset/:id", authenticate, resetpassword);

// router.put('/logout', authenticate, logOut);

// router.post("/book/:userId", authenticate, requestAppointment)

// router.post("/request/:userId", authenticate, handleAppointmentRequest)

// router.get("/all-requests",getAllRequest)

// router.get("/one-request/:appointmentId", admin, viewOneAppointRequest)

// router.delete("/delete-request/:appointmentId", admin, deleteRequest)

// router.post('/reminders', sendAppointmentReminders);

// router.delete('/cancel/:appointmentId', authenticate, cancelAppointment);

// router.put('/reschedule/:appointmentId', authenticate, rescheduleAppointment);

// router.post('/send-message', message,)

// module.exports = router

