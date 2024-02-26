const notificationModel = require("../models/notificationModel")


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
