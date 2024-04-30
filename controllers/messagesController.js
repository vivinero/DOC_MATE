const Message = require('../models/messagesModel.js');
require('dotenv').config();



// API endpoint for sending messages
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { message } = req.body;
        if(!message){
          return res.status(400).json({
            message: "Please provide a message"
          })
        }
  
      // Save the message to MongoDB
      const newMessage = new Message({ 
        user: userId, 
        role: 'user',
        message: message 
    });

    //  // validation: Check if userInput is empty
    //  if (!newMessage || newMessage .trim() === '') {
    //   return res.status(400).json({ 
    //     error: 'Chat box cannot be empty' 
    //   });
    // }


    if (!newMessage) {
        return res.status(400).json({
            message: "Unable to save message to database"
        })
    }
      await newMessage.save();
      return res.status(201).json({
        message: "Message saved successfully",
        data: newMessage
      });

    } catch (error) {
      return res.status(500).json({ 
        Error: 'Internal server error: ' + error.message,
    });
    }
  };
  


  // API endpoint for viewing messages and responses from a particular user   
 const getMessages = async (req, res) => {
      try {
        const userId = req.user.userId;
    
        // Find messages and responses associated with the user
        const userMessages = await Message.find({ user: userId }).sort({ createdAt: -1 });
        if (userMessages.length === 0) {
            return res.status(404).json({
                message: "No messages associated with this user!"
            })
        }
    
        return res.status(200).json({ 
            success: "Messages successfully fetched!",
            messages: userMessages 
        });
      } catch (error) {
        return res.status(500).json({ 
            Error: 'Internal server error: ' + error.message,
        });
      }
};



module.exports = {
    sendMessage, 
    getMessages,

}