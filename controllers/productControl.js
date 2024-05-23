const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { validateProductInput, validateProductUpdate,  } = require('../middleware/validator');
const cloudinary = require('../middleware/cloudinary')
const fs = require("fs")



// Function to add a product
const AddProduct = async (req, res) => {
    try {
      const { error } = validateProductInput(req.body);
      if (error) {
        return res.status(500).json({
          message: error.details[0].message
        })
      } else {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
   
        const product =  {
            productName: req.body.productName.trim(),
            category: req.body.category.trim(),
            brand: req.body.brand.trim(), 
            productDescription: req.body.productDescription.trim(),
            costPrice: req.body.costPrice,
            sellingPrice: req.body.sellingPrice,  
            stockQty: req.body.stockQty,
           
        }

        if (!product) {
            return res.status(400).json({
                message: 'Please enter the product name, category, brand, product description, cost price, and selling price',
            })
        }

                const images = req.files.images.tempFilePath
        const fileUploader = await cloudinary.uploader.upload(images, { folder: "Product-Media" }, (err, images) => {
            try {
      
              // Delete the temporary file
              fs.unlinkSync(req.files.images.tempFilePath);
      
              return images
            } catch (err) {
              return err
            }
          })

        // let images = [];

        // // Upload images to Cloudinary
        // for (const file of req.files) {
        //     const result = await cloudinary.uploader.upload(file.path);
        //     images.push(result.secure_url);
        // }

        
        //Check if product already exist within the business
        const checkProduct = await productModel.findOne({ userId: userId, productName: product.productName.toLowerCase() });
            if (checkProduct) {
                return res.status(400).json({
                    message: 'Product already exist'
                });
            }

        const newProduct = new productModel({
            productName: product.productName.toLowerCase(),
            category: product.category.toLowerCase(),
            brand: product.brand.toLowerCase(),
            productDescription: product.productDescription.toLowerCase(),
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            stockQty: product.stockQty,
            images:{
                url: fileUploader.url,
                public_id: fileUploader.public_id
            },
            lastUpdated: new Date().toLocaleDateString(),
            userId: userId,
        })

        if (!newProduct) {
            return res.status(400).json({
                message: 'Product record not saved',
            })
        }
        await newProduct.save();
        user.products.push(newProduct);
        await user.save();

        return res.status(200).json({
            message: 'Product added successfully',
            data: newProduct
        });
      }  
    //   if (user) {
    //     user.products.push(newProduct);
    //     await user.save();
    //   } else {
    //     return res.status(500).json({ message: 'Error saving product' })
    //   }
    // }
  
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
          })
    }
}



// Function to view a product information
const viewOneProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await productModel.findById(productId)
        if  (!product) {
            return res.status(404).json({ 
                message: "Product not found"
            });
        }
        
        return res.status(200).json({
            message: "The selected product is: ", 
            data: product
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
          })
    }
}



// Function to view all product information
// const viewAllProduct = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const products = await productModel.find({userId: userId}).sort({updatedAt: -1});
//         if (!products) {
//             return res.status(404).json({ 
//                 message: "Product not found"
//             });
//         }

//         // Filter products by user ID and then retrieve distinct categories
//         const distinctCategories = await productModel.distinct("category", { userId: userId });
//         const totalCategories = distinctCategories.length;

//         return res.status(200).json({
//             message: "List of all products for ", 
//             totalProducts: products.length, 
//             totalCategory: totalCategories,
//             data: products,
//         });
        
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Internal Server Error: ' + error.message,
//           })
//     }
// }
const viewAllProduct = async (req, res) => {
    try {
       // const userId = req.params.userId;
        const products = await productModel.find().sort({updatedAt: -1});
        if (!products) {
            return res.status(404).json({ 
                message: "Product not found"
            });
        } else {
            res.status(201).json({
                message: "All available products.",
                data: products,
                totalNumberOfProductsAvailable: products.length,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
};
const updateProduct = async (req, res) => {
  try {
    const { error } = validateProductUpdate(req.body);
    if (error) {
      return res.status(500).json({ message: error.details[0].message });
    }

    const productId = req.params.productId;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productData = {
      productName: req.body.productName || product.productName,
      category: req.body.category || product.category,
      brand: req.body.brand || product.brand,
      productDescription: req.body.productDescription || product.productDescription,
      costPrice: req.body.costPrice || product.costPrice,
      sellingPrice: req.body.sellingPrice || product.sellingPrice,
      stockQty: req.body.stockQty || product.stockQty,
      lastUpdated: new Date().toLocaleDateString(),
    };

    // Check if a new image is provided
    if (req.files && req.files.updatedImages) {
      const updatedImages = req.files.updatedImages.tempFilePath;
      const fileUploader = await cloudinary.uploader.upload(updatedImages, {
        folder: "Product-Media",
      });

      // Optionally, delete the old image from Cloudinary
      if (product.images && product.images.public_id) {
        await cloudinary.uploader.destroy(product.images.public_id);
      }

      // Set the new image URL and public ID
      productData.images = {
        url: fileUploader.secure_url,
        public_id: fileUploader.public_id
      };

      // Delete the temporary file
      fs.unlinkSync(req.files.updatedImages.tempFilePath);
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: productData },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({ message: "Unable to update product" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

// const updateProduct = async (req, res) => {
//   try {
//     const { error } = validateProductUpdate(req.body);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const productId = req.params.productId;
//     const product = await productModel.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Prepare the updated product data
//     const productData = {
//       productName: req.body.productName || product.productName,
//       category: req.body.category || product.category,
//       brand: req.body.brand || product.brand,
//       productDescription: req.body.productDescription || product.productDescription,
//       costPrice: req.body.costPrice || product.costPrice,
//       sellingPrice: req.body.sellingPrice || product.sellingPrice,
//       stockQty: req.body.stockQty || product.stockQty,
//       lastUpdated: new Date().toLocaleDateString(),
//     };

//     // Handle image upload if a new image is provided
//     if (req.files && req.files.updatedImages) {
//       const updatedImages = req.files.updatedImages.tempFilePath;
//       const fileUploader = await cloudinary.uploader.upload(updatedImages, { folder: "Product-Media" });

//       // Delete the temporary file
//       fs.unlinkSync(req.files.updatedImages.tempFilePath);

//       // Update the product's image field
//       productData.images = {
//         url: fileUploader.secure_url,
//         public_id: fileUploader.public_id
//       };
//     }

//     // Update the product in the database
//     const updatedProduct = await productModel.findByIdAndUpdate(productId, { $set: productData }, { new: true });

//     if (!updatedProduct) {
//       return res.status(400).json({ message: "Unable to update product" });
//     }

//     res.status(200).json({
//       message: "Product updated successfully",
//       data: updatedProduct,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error: " + error.message,
//     });
//   }
// };


// const updateProduct = async (req, res) => {
//   try {
//     const { error } = validateProductUpdate(req.body);
//     if (error) {
//       return res.status(500).json({ message: error.details[0].message });
//     } else {
//       const productId = req.params.productId;
//       const product = await productModel.findById(productId);
//       if (!product) {
//         return res.status(404).json({ message: "Product not found" });
//       }
//       const productData = {
//         productName: req.body.productName || product.productName,
//         category: req.body.category || product.category,
//         brand: req.body.brand || product.brand,
//         productDescription: req.body.productDescription || product.productDescription,
//         costPrice: req.body.costPrice || product.costPrice,
//         sellingPrice: req.body.sellingPrice || product.sellingPrice,
//         stockQty: req.body.stockQty || product.stockQty,
//         lastUpdated: new Date().toLocaleDateString(),
//       };
//       const updatedImages = req.files.updatedImages.tempFilePath;
//       const fileUploader = await cloudinary.uploader.upload(updatedImages, {
//         folder: "Product-Media",
//       }, (err, updatedImages) => {
//         try {
//           // Delete the temporary file
//           fs.unlinkSync(req.files.updatedImages.tempFilePath);
//           return updatedImages;
//         } catch (err) {
//           return err;
//         }
//       });
//       const updatedProduct = await productModel.findByIdAndUpdate(
//                     productId,
//                     {
//                       $set: productData,
//                       $push: { updatedImages: { $each: [updatedImages] }},
//                     },
//                     { new: true }
//                   );
                  
//       if (!updatedProduct) {
//         return res.status(400).json({ message: "Unable to update product" });
//       }
//       const currentTimestamp = new Date().getTime();
//       res.status(200).json({
//         message: "Product updated successfully",
//         data: updatedProduct,
//         //image: `<img src="${updatedImages[0].secure_url}?timestamp=${currentTimestamp}" />`,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error: " + error.message,
//     });
//   }
// };


// Function to update a product 
// const  updateProduct = async (req, res) => {
//     try {
//       const { error } = validateProductUpdate(req.body);
//       if (error) {
//         return res.status(500).json({
//           message: error.details[0].message
//         })
//       } else {
//         const productId = req.params.productId
//         const product = await productModel.findById(productId)
//         if  (!product) {
//             return res.status(404).json({ 
//                 message: "Product not found"
//             });
//         }

//         const productData = {
//             productName: req.body.productName  ||  product.productName,
//             category: req.body.category ||  product.category,
//             brand: req.body.brand  ||  product.brand,
//             productDescription: req.body.productDescription  || product.productDescription, 
//             costPrice: req.body.costPrice  ||  product.costPrice, 
//             sellingPrice: req.body.sellingPrice  ||  product.sellingPrice, 
//             stockQty: req.body.stockQty  ||  product.stockQty,
//             lastUpdated: new Date().toLocaleDateString(),
    
//         }
//         const updatedImages = req.files.updatedImages.tempFilePath
//         const fileUploader = await cloudinary.uploader.upload(updatedImages, { folder: "Product-Media" }, (err, updatedImages) => {
//             try {
      
//               // Delete the temporary file
//               fs.unlinkSync(req.files.updatedImages.tempFilePath);
      
//               return updatedImages
//             } catch (err) {
//               return err
//             }
//           })

//         // const updatedProduct = await productModel.findByIdAndUpdate(productId, {productData, $push: { updatedImages: { $each: updatedImages }}}, {new: true});
//         const updatedProduct = await productModel.findByIdAndUpdate(
//             productId,
//             {
//               $set: productData,
//               $push: { updatedImages: { $each: [updatedImages] }},
//             },
//             { new: true }
//           );
          
//         if (!updatedProduct) {
//             return res.status(400).json({ 
//                 message: "Unable to update product"
//             });
//         }
        
//         return res.status(200).json({
//             message: "Product updated successfully",
//             data: updatedProduct
//         })
//     }
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Internal Server Error: ' + error.message,
//           })
//     }
// }



//  Function to delete a product
const  deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await productModel.findById(productId)
        if  (!product) {
            return res.status(404).json({ 
                message: "Product not found"
            });
        }

        const deleteAProduct = await productModel.findByIdAndDelete(productId);
        if (!deleteAProduct) {
            return res.status(400).json({ 
                message: "Unable to delete Product"
            });
        }

        const userId = req.params.userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        const productIndex = user.products.indexOf(productId);

        if (productIndex === -1) {
            return res.status(400).json({
                message: "Unable to delete product from user data"
            });
        } else {
            user.products.splice(productIndex, 1);
            await user.save();
        }
          
        return res.status(200).json({
            message: "Product successfully deleted"
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
          })
    }
};



module.exports = {
    AddProduct, 
    viewOneProduct,
    viewAllProduct,
    updateProduct, 
    deleteProduct,

}