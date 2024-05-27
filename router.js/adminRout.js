const adminRouter = require("express").Router()

const {register, verifyAdmin, loginAdmin, forgotpassWordAdmin,getOneAdmin, resetpasswordAdmin, uploadProfilePictureAdmin,
     deleteProfilePictureAdmin, logOutAdmin, getAllRequest, deleteRequest, viewOneAppointRequest, getAllPatient, getOnePatient, updateAdminProfile,
     getAllPatientsInHospital, getPayments, deletePayment, deleteAllPayments
    }

 = require("../controllers/adminControl")
const {adminAuthenticate} = require("../middleware/adminAuth")


adminRouter.post("/signup", register)
adminRouter.post("/adminlogin", loginAdmin)
adminRouter.post("/forgot-admin", forgotpassWordAdmin)
adminRouter.get("/verify-admin/:id/:token", verifyAdmin)
adminRouter.put("/reset-admin/:id", resetpasswordAdmin);
adminRouter.post("/updateadmin/:id", adminAuthenticate,uploadProfilePictureAdmin)
adminRouter.post("/signout-admin", adminAuthenticate,logOutAdmin)
adminRouter.delete("/deleteImg/:id",adminAuthenticate, deleteProfilePictureAdmin)
adminRouter.get("/all-requests",adminAuthenticate, getAllRequest)
adminRouter.get("/one-request", adminAuthenticate,viewOneAppointRequest)
// adminRouter.get("/all-patient", adminAuthenticate,getAllPatient)
adminRouter.get("/all-patients", adminAuthenticate, getAllPatientsInHospital)
adminRouter.get("/one-patient/:id", adminAuthenticate,getOnePatient)
adminRouter.get("/one-admin", adminAuthenticate, getOneAdmin)
// adminRouter.delete("/delete-patient", adminAuthenticate, deleteOnePatient)
adminRouter.put("/admin-profile-update/:id", adminAuthenticate, updateAdminProfile)
adminRouter.delete("delete-app/:id", deleteRequest)
// Define the route for the new endpoint
adminRouter.get('/all-payment', adminAuthenticate, getPayments);
// Define the route for deleting one payment
adminRouter.delete('/delete-payment/:paymentId',adminAuthenticate, deletePayment);

// Define the route for deleting all payments
adminRouter.delete('/delete-all-payment', adminAuthenticate, deleteAllPayments);



module.exports = adminRouter