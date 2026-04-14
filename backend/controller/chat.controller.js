const Chat = require("../models/chat.model");

exports.accessChat = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User id is required",
            });
        }

        let chat = await Chat.findOne({
            members: { $all: [req.user.id, userId] },
        })
            .populate("members", "name email pic")
            .populate({
                path: "latestMessage",
                populate: { path: "sender", select: "name email pic" },
            });

        if (!chat) {
            chat = await Chat.create({
                members: [req.user.id, userId],
            });

            chat = await Chat.findById(chat._id).populate("members", "name email pic");
        }

        return res.status(200).json({
            success: true,
            chat,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to access chat",
        });
    }
};

exports.fetchChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            members: { $in: [req.user.id] },
        })
            .populate("members", "name email pic")
            .populate({
                path: "latestMessage",
                populate: { path: "sender", select: "name email pic" },
            })
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            chats,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch chats",
        });
    }
};
