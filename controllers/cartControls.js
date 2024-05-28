const Cart = require("../models/cartModel")

const Product = require("../models/productModel")

const User = require("../models/userModel")

const app = require("../middleware/sessions")

const mongoose = require('mongoose');






const addToCart = async (req, res) => {
    try {
        console.log('Session:', req.app); // Debugging line
        const productId = req.params.productId;
        const { quantity } = req.body;

        // Check if the productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.user) {
            // If user is authenticated, add item to cart in the database
            const userId = req.user.userId;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Create or update cart
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                // Create new cart if it doesn't exist
                cart = new Cart({
                    user: userId,
                    items: [{ product: productId, quantity: parseInt(quantity) }] // Parse quantity to integer
                });
            } else {
                // Update existing cart
                const index = cart.items.findIndex(item => item.product.equals(productId));
                if (index !== -1) {
                    // If product already exists in cart, update quantity
                    cart.items[index].quantity += parseInt(quantity); // Parse quantity to integer
                } else {
                    // If product doesn't exist in cart, add it
                    cart.items.push({ product: productId, quantity: parseInt(quantity) }); // Parse quantity to integer
                }
            }

            // Save cart
            await cart.save();

            return res.status(200).json({
                message: 'Product added to cart successfully',
                data: cart
            });
        } else {
            // If user is not authenticated, add item to session cart

           // Ensure req.session is initialized
            if (!req.app) {
                req.app = {};
            }

            // Ensure req.session.cart is initialized
            if (!req.app.cart) {
                req.app.cart = [];
            }

            // Check if product is already in the session cart
            const index = req.app.cart.findIndex(item => item.product === productId);
            if (index !== -1) {
                // If product already exists in session cart, update quantity
                req.app.cart[index].quantity += parseInt(quantity); // Parse quantity to integer
            } else {
                // If product doesn't exist in session cart, add it
                req.app.cart.push({ product: productId, quantity: parseInt(quantity) }); // Parse quantity to integer
            }
            console.log('Updated session cart:', req.app.cart); // Debugging line

            return res.status(200).json({
                message: 'Item added to visitor cart successfully',
                data: req.app.cart
            });
        }
    } catch (err) {
        return res.status(500).json({
            Error: 'Internal Server Error: ' + err.message,
        });
    }
};



// exports.addToCart = async (req, res) => {
//     try {
//         const { userId, productId } = req.body
//         //check if product already exist

//         let cartItem = await Cart.findOne({ userId, productId })
//         if (cartItem) {
//             // if product exist increase the quantity
//             cartItem.quantity = + 1;
//         } else {
//             // if product doesnot exist create new cart item 
//             cartItem = new Cart({ userId, productId })
//         }
//         //save cart item
//         await cartItem.save()
//         //throw success response
//         res.status(200).json({
//             message: 'Product added to cart successfully',
//             data: cartItem
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error" + error.message
//         })
//     }
// }

// exports.removeFromCart = async (req, res) => {
//     try {
//         const userId = req.user.id
//         const { productId } = req.params

//         //remove items from cart
//         await Cart.findAndRemove({ userId, productId })

//         res.status(200).json({
//             message: "Items have been removed from cart successfully"
//         })
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error" + error.message
//         })

//     }
// }
const removeFromCart = async (req, res) => {
    try {
        console.log('Session:',req.app)
        const productId = req.params.productId;
        console.log('Product ID to remove:', productId);


        if (req.user) {
            // If user is authenticated, remove item from user's cart in the database
            const userId = req.user.id;

            // Find the user's cart
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Remove the item from the cart
            cart.items = cart.items.filter(item => !item.product.equals(productId));

            // Save the updated cart
            await cart.save();

            res.status(200).json({ message: 'Item removed from cart successfully' });
        } else {
            // If user is not authenticated, remove item from session cart
            // Ensure req.session is initialized

            // if (!req.app) {
            //     return res.status(500).json({ message: 'Session not initialized' });
            // }
            if (!req.app) {
                req.app = {};
            }

            // Ensure req.session.cart is initialized
            req.app.cart = req.app.cart || [];
            console.log('Session cart before removal:', req.app.cart);

             // Remove the item from the session cart
             //req.app.cart = req.session.cart.filter(item => item.product.toString() !== productId);

            // Remove the item from the session cart
            req.app.cart = req.app.cart.filter(item => item.productId !== productId);

            res.status(200).json({ message: 'Item removed from cart successfully' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};

const updateQuantity = async (req, res) => {
    try {
        if (req.user) {
            // If user is authenticated, update quantity in the database
            const userId = req.user.id;
            const productId = req.params.productId;
            const { quantity } = req.body;

            // Find the user's cart and update the quantity of the specific product
            const cart = await Cart.findOne({ user: userId, 'items.product': productId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
            if (itemIndex !== -1) {
                cart.items[itemIndex].quantity = parseInt(quantity, 10); // Ensure quantity is an integer
                await cart.save();
                return res.status(200).json({ message: 'Quantity updated successfully' });
            } else {
                return res.status(404).json({ message: 'Product not found in cart' });
            }
        } else {
            // If user is not authenticated, update quantity in session cart
            if (!req.app || !req.app.cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const productId = req.params.productId;
            const { quantity } = req.body;

            const itemIndex = req.app.cart.findIndex(item => item.product === productId);

            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            req.app.cart[itemIndex].quantity = parseInt(quantity, 10); // Ensure quantity is an integer
            return res.status(200).json({ message: 'Quantity updated successfully' });
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};

const viewCartContents = async (req, res) => {
    try {
        if (req.user) {
            // If user is authenticated, fetch cart contents from the database
            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate({
                path: 'items.product',
                model: 'Product',
                select: '-__v -userId -stockQty -lastUpdated' // Example: exclude the version field
            });
            if (cart) {
                res.status(200).json({
                    message: 'Cart contents retrieved successfully',
                    data: cart.items
                });
            } else {
                res.status(404).json({ message: 'Cart is empty or not found' });
            }
        } else {
            // If user is not authenticated, fetch cart contents from session cart
            if (req.app.cart && req.app.cart.length > 0) {
                // Fetch product details for each product in the session cart
                const productIds = req.app.cart.map(item => item.product);
                const products = await Product.find({ _id: { $in: productIds } });

                // Map session cart items to include full product details
                const sessionCart = req.app.cart.map(item => {
                    const product = products.find(p => p._id.equals(item.product));
                    return {
                        ...item,
                        product
                    };
                });

                res.status(200).json({
                    message: 'Cart contents retrieved successfully',
                    data: sessionCart
                });
            } else {
                res.status(404).json({ message: 'Cart is empty or not found' });
            }
        }
    } catch (error) {
        console.error('Error retrieving cart contents:', error);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
};




//     try {
//         if (req.user) {
//             // If user is authenticated, remove item from user's cart in the database
//             const userId = req.user.id;
//             const productId = req.params.productId;
//             // Remove the item from the user's cart in the database
//             await Cart.findOneAndDelete({ userId, productId });
//             res.status(200).json({ message: 'Item removed from cart successfully' });
//         } else {
//             // If user is not authenticated, remove item from session cart
//             const productId = req.params.productId;
//             // Remove the item from the session cart
//             req.session.cart = req.session.cart.filter(item => item.productId !== productId);
//             res.status(200).json({ message: 'Item removed from cart successfully' });
//         }
//     } catch (error) {
//         console.error('Error removing item from cart:', error);
//         res.status(500).json({ message: 'Internal server error' + error.message });
//     }
// };

// exports.removeFromCart = async (req, res) => {
//     try {
//         // const {userId} = req.user;
//         const { productId } = req.params;

//         // Find and remove the item from the cart
//         const result = await Cart.findOneAndDelete(productId);

//         // Check if the item was found and deleted
//         if (!result) {
//             return res.status(404).json({
//                 message: "Item not found in cart"
//             });
//         }

//         res.status(200).json({
//             message: "Item has been removed from cart successfully"
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error: " + error.message
//         });
//     }
// };


// const updateQuantity = async (req, res) => {
//     try {
//         const productId = req.params.productId;
//         const { quantity } = req.body;

//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({ message: 'Invalid quantity' });
//         }

//         if (req.user) {
//             // If user is authenticated, update quantity in the user's cart in the database
//             const userId = req.user.id;

//             const cart = await Cart.findOne({ user: userId });
//             if (!cart) {
//                 return res.status(404).json({ message: 'Cart not found' });
//             }

//             const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
//             if (itemIndex === -1) {
//                 return res.status(404).json({ message: 'Item not found in cart' });
//             }

//             cart.items[itemIndex].quantity = quantity;
//             await cart.save();

//             return res.status(200).json({ message: 'Quantity updated successfully' });
//         } else {
//             // If user is not authenticated, update quantity in session cart
//             if (!req.session.cart) {
//                 req.session.cart = []; // Initialize session cart if it doesn't exist
//             }

//             const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
//             if (itemIndex === -1) {
//                 return res.status(404).json({ message: 'Item not found in cart' });
//             }

//             req.session.cart[itemIndex].quantity = quantity;
//             return res.status(200).json({ message: 'Quantity updated successfully' });
//         }
//     } catch (error) {
//         console.error('Error updating quantity:', error);
//         return res.status(500).json({ message: 'Internal server error: ' + error.message });
//     }
// };
// const viewCartContents = async (req, res) => {
//     try {
//         if (req.user) {
//             // If user is authenticated, fetch cart contents from the database
//             const userId = req.user.id;
//             const cartItems = await Cart.find({ userId }).populate('product');
//             res.status(200).json({
//                 message: 'Cart contents retrieved successfully',
//                 data: cartItems
//             });
//         } else {
//             // If user is not authenticated, fetch cart contents from session cart
//             if (req.app.cart && req.app.cart.length > 0) {
//                 res.status(200).json({
//                     message: 'Cart contents retrieved successfully',
//                     data: req.app.cart
//                 });
//             } else {
//                 res.status(404).json({ message: 'Cart is empty or not found' });
//             }
//         }
//         //console.log('Updated session cart:', req.app.cart); // Debugging line
//     } catch (error) {
//         console.error('Error retrieving cart contents:', error);
//         res.status(500).json({ message: 'Internal server error' + error.message });
//     }
// };




const clearCart = async (req, res) => {
    try {
        if (req.user) {
            // If user is authenticated, remove all items from the user's cart in the database
            const userId = req.user.id;

            await Cart.deleteMany({ userId });
        } else {
            // If user is not authenticated, clear session cart
            req.app.cart = [];
        }

        return res.status(200).json({
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        return res.status(500).json({ message: 'Internal server error' + error.message });
    }
};



// exports.updateQuantity = async (req, res)=> {
//     try {
//         // const userId = req.user.id
//         const {productId} = req.params
//         const {quantity} = req.body
// //update quantity of the item
//         await Cart.findOneAndUpdate({productId}, {quantity})
//         res.status(200).json({
//             message: "Items has been updated successfully"
//         })
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error" + error.message
//         })
//     }
// }

// exports.viewCartContent = async(req, res)=> {
//     try {
//         // const userId = req.user.id
//         const { cartId } = req.params
//         //get all item in the user's cart
//         const  cartItems = await Cart.findOne({cartId}).populate('productId')
//         if (!cartItems) {
//             return res.status(404).json({
//                 error: "Unable to retrive cart item, because it is empty or does not exist"
//             })
//         }
//         res.status(200).json({
//             message: 'Cart contents successfully retrieved',
//             data: cartItems
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: "Internal Server Error" + error.message
//         })
//     }
// }

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

// exports.clearCart = async (req, res) => {
//     try {
//         // Retrieve sessionId from cookies or query parameters
//         const sessionId = req.cookies.sessionId || req.query.sessionId;

//         if (!sessionId) {
//             return res.status(400).json({
//                 message: 'Session ID is required'
//             });
//         }

//         // Find the cart by session ID and clear its items
//         const cart = await Cart.findOneAndUpdate(
//             { sessionId },
//             { $set: { items: [] } },
//             { new: true }
//         );

//         if (!cart) {
//             return res.status(404).json({
//                 message: 'Cart not found'
//             });
//         }

//         res.status(200).json({
//             message: 'Cart successfully cleared',
//             data: cart.items
//         });
//     } catch (error) {
//         console.error('Error clearing cart:', error);
//         res.status(500).json({
//             error: 'Internal Server Error: ' + error.message
//         });
//     }
// };


const movedToSave = async (req, res) => {
    try {
        const userId = req.user.id
        const productId = req.params.productId

        //move items to save
        await Cart.findOneAndUpdate({ userId, productId }, { savedForLater: true })
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

const moveItemsBackToCart = async (req, res) => {
    try {
        const userId = req.user.id
        const productId = req.parama.productId;
        await Cart.findByIdAndUpdate({ userId, productId }, { savedForLater: false })

        res.status(200).json({
            message: 'Item moved back to cart successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error" + error.message
        })
    }
}
module.exports = { addToCart, removeFromCart, updateQuantity, moveItemsBackToCart, movedToSave, clearCart, viewCartContents }