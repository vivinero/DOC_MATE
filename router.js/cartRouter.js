const express = require("express")
const cartRouter = express.Router()
const { addToCart, removeFromCart, updateQuantity, moveItemsBackToCart, movedToSave, clearCart, viewCartContents } = require("../controllers/cartControls")
// const {authenticate} = require("../middleware/authentication")

cartRouter.post("/add-to-cart/:productId", addToCart)
cartRouter.delete("/remove-from-cart/:productId", removeFromCart)
cartRouter.put("/update-quantity/:productId", updateQuantity)
cartRouter.get("/view-cart-content", viewCartContents)
cartRouter.delete("/clear-cart", clearCart)
cartRouter.post("/move-tosave", movedToSave)
cartRouter.post("/move-item-backTo-cart", moveItemsBackToCart)


module.exports = cartRouter