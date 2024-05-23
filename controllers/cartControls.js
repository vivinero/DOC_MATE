const Cart = require("../models/cartModel")

exports.addToCart = async(req, res)=> {
    try {
        const {userId, productId} = req.body
        //check if product already exist

        let cartItem = await Cart.findOne({userId, productId})
        if (cartItem) {
            // if product exist increase the quantity
            cartItem.quantity =+ 1;
        } else {
            // if product doesnot exist create new cart item 
            cartItem = new Cart({userId, productId})
        }
        //save cart item
        await cartItem.save()
        //throw success response
        res.status(200).json({ 
            message: 'Product added to cart successfully', 
            data: cartItem 
        });
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error" + error.message
        })
    }
}

// exports.removeFromCart = async (req, res)=> {
//     try {
//         const userId = req.user.id
//         const {productId} = req.params

//         //remove items from cart
//         await Cart.findAndRemove({userId, productId}) 

//         res.status(200).json({
//             message: "Items have been removed from cart successfully"
//         })
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error" + error.message
//         })
        
//     }
// }

exports.removeFromCart = async (req, res) => {
    try {
        // const {userId} = req.user;
        const { productId } = req.params;

        // Find and remove the item from the cart
        const result = await Cart.findOneAndDelete(productId);

        // Check if the item was found and deleted
        if (!result) {
            return res.status(404).json({
                message: "Item not found in cart"
            });
        }

        res.status(200).json({
            message: "Item has been removed from cart successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error: " + error.message
        });
    }
};

exports.updateQuantity = async (req, res)=> {
    try {
        // const userId = req.user.id
        const {productId} = req.params
        const {quantity} = req.body
//update quantity of the item
        await Cart.findOneAndUpdate({productId}, {quantity})
        res.status(200).json({
            message: "Items has been updated successfully"
        })
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error" + error.message
        })
    }
}

exports.viewCartContent = async(req, res)=> {
    try {
        // const userId = req.user.id
        const { cartId } = req.params
        //get all item in the user's cart
        const  cartItems = await Cart.findOne({cartId}).populate('productId')
        if (!cartItems) {
            return res.status(404).json({
                error: "Unable to retrive cart item, because it is empty or does not exist"
            })
        }
        res.status(200).json({
            message: 'Cart contents successfully retrieved',
            data: cartItems
        });
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error" + error.message
        })
    }
}

// exports.clearCart = async (req, res)=>{
//     try {
        
//         // const userId = req.user.userId

//         //remove all items from the user cart
//         await Cart.deleteMany({userId})

//         res.status(200).json({
//             message: 'Cart successfully cleared',
//             data: cartItems
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error" + error.message
//         })
//     }
// }

exports.clearCart = async (req, res) => {
    try {
        // Retrieve sessionId from cookies or query parameters
        const sessionId = req.cookies.sessionId || req.query.sessionId;

        if (!sessionId) {
            return res.status(400).json({
                message: 'Session ID is required'
            });
        }

        // Find the cart by session ID and clear its items
        const cart = await Cart.findOneAndUpdate(
            { sessionId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        res.status(200).json({
            message: 'Cart successfully cleared',
            data: cart.items
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            error: 'Internal Server Error: ' + error.message
        });
    }
};


exports.movedToSave = async (req, res)=> {
    try {
        const userId = req.user.id
        const productId = req.params.productId

        //move items to save
        await Cart.findOneAndUpdate({userId, productId}, {savedForLater: true})
        //success response
        res.status(200).json({
            message: 'Item moved to saved items successfully',
        });

    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error" + error.message
        })
    }
}

exports.moveItemsBackToCart = async (req, res)=> {
    try {
        const userId = req.user.id
        const productId = req.parama.productId;
        await Cart.findByIdAndUpdate({userId, productId}, {savedForLater: false})

        res.status(200).json({
            message: 'Item moved back to cart successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error" + error.message
        })
    }
}