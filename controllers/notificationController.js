const notificationModel = require("../models/notificationModel")
const adminModel = require("../models/adminModel")

//get one
exports.getOne = async (req, res) => {
     try {
        const userId = req.user.userId
        const id = req.params.id
        const admin = await adminModel.findById(userId)
        if (!admin) {
            return res.status(404).json({
                message: "unable to find hospital"
            })
        }
        const notify = await notificationModel.findById(id)
        if (!notify) {
            return res.status(404).json({
                message: "unable to find notification"
            })
        }
        res.status(200).json({
            message: "Successfully gotten one"
        })

     } catch (error) {
        res.status(500).json({
            message: error.message
        });
     }
}


exports.getAllNotification = async (req, res) => {
    try {
        const notifications = await notificationModel.find().sort({createdAt: -1}).populate();
        if (!notifications || notifications.length === 0) {
            return res.status(404).json({
                message: "No notifications found"
            });
        }
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const {id} = req.params
        const del = await notificationModel.findByIdAndDelete(id)
        if (!del) {
            return res.status(404).json({
                message: "Couldn't find notification to delete"
            })
        }
        return res.status(200).json({
            message: `You have successfully deleted this notification`
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
