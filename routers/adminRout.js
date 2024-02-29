const adminRouter = require("express").Router()

const { register, logIn, updateAdmin, signOutAdmin  } = require("../controllers/adminControl")



adminRouter.post("/signup", register)
adminRouter.post("/adminlogin", logIn)
adminRouter.post("/updateadmin/:id", updateAdmin)
adminRouter.post("/signoutadmin", signOutAdmin)


module.exports = adminRouter