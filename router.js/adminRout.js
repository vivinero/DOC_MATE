const adminRouter = require("express").Router()

const {register, verifyAdmin, loginAdmin, forgotpassWordAdmin, resetpasswordAdmin, uploadProfilePictureAdmin, deleteProfilePictureAdmin, logOutAdmin}
 = require("../controllers/adminControl")



adminRouter.post("/signup", register)
adminRouter.post("/adminlogin", loginAdmin)
adminRouter.put("/forgot", forgotpassWordAdmin)
adminRouter.get("/verify/:id/:token", verifyAdmin)
adminRouter.put("/reset", resetpasswordAdmin);
adminRouter.post("/updateadmin/:id", uploadProfilePictureAdmin)
adminRouter.post("/signoutadmin", logOutAdmin)
adminRouter.delete("/deleteImg/:id", deleteProfilePictureAdmin)


module.exports = adminRouter