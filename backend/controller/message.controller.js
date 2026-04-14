const Message = require("../models/message.model");
const Chat = require("../models/chat.model");

exports.sendMessage = async (req, res) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            return res.status(400).json({
                success: false,
                message: "Content and chat id are required",
            });
        }

        let message = await Message.create({
            sender: req.user.id,
            content,
            chat: chatId,
        });

        message = await message.populate("sender", "name email pic");

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message._id,
        });

        return res.status(201).json({
            success: true,
            message,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name email pic")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
};
