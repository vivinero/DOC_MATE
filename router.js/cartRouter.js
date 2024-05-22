const express = require("express")
const cartRouter = express.Router()
const { addToCart, removeFromCart, updateQuantity, moveItemsBackToCart, movedToSave, clearCart, viewCartContent } = require("../controllers/cartControls")
// const {authenticate} = require("../middleware/authentication")

cartRouter.post("/add-to-cart", addToCart)
cartRouter.delete("/remove-from-cart/:productId", removeFromCart)
cartRouter.put("/update-quantity/:productId", updateQuantity)
cartRouter.get("/view-cart-content", viewCartContent)
cartRouter.delete("/clear-cart", clearCart)
cartRouter.post("/move-tosave", movedToSave)
cartRouter.post("/move-item-backTo-cart", moveItemsBackToCart)


module.exports = cartRouter