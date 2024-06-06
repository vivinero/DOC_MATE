

// Import your Mongoose model
const productModel = require("../models/productModel"); 



const searchProduct = async (req, res) => {
  try {
    // Extract the search query from the request
    const searchQuery = req.query.q;
    //console.log(req.query);
    let products;

    if (searchQuery) {

      // If search query is provided, filter hospitals by name starting with the query
      products = await productModel.find({
        productName: { $regex: `^${searchQuery}`, $options: 'i' }
      })
        .sort({ productName: 1 }); // Sort hospitals alphabetically by name
    } else {
      // If no search query is provided, return an empty array
      products = [];
    }
    //console.log(`Search query: ${searchQuery}`);
    //console.log(`Hospitals: ${products}`);


    if (products.length === 0) {
      return res.status(200).json({ message: "No hospitals found." });
    } else {
      return res.status(200).json({
        message: "List of Products",
        totalNumberOfProducts: products.length,
        data: products
        
      });
      
    }

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }}







module.exports = searchProduct;
