const adminRouter = require("express").Router()

const {register, verifyAdmin, loginAdmin, forgotpassWordAdmin, resetpasswordAdmin, uploadProfilePictureAdmin, deleteProfilePictureAdmin, logOutAdmin, getAllRequest, deleteRequest, viewOneAppointRequest}

 = require("../controllers/adminControl")
const {adminAuthenticate} = require("../middleware/adminAuth")


adminRouter.post("/signup", register)
adminRouter.post("/adminlogin", loginAdmin)
adminRouter.post("/forgot-admin",adminAuthenticate, forgotpassWordAdmin)
adminRouter.get("/verify-admin/:id/:token", verifyAdmin)
adminRouter.put("/reset-admin/:id",adminAuthenticate, resetpasswordAdmin);
adminRouter.post("/updateadmin/:id", adminAuthenticate,uploadProfilePictureAdmin)
adminRouter.post("/signout-admin", adminAuthenticate,logOutAdmin)
adminRouter.delete("/deleteImg/:id",adminAuthenticate, deleteProfilePictureAdmin)
adminRouter.get("/all-requests",adminAuthenticate, getAllRequest)
adminRouter.get("/one-request", adminAuthenticate,viewOneAppointRequest)


adminRouter.delete("delete-request/:id",adminAuthenticate, deleteRequest)


module.exports = adminRouter