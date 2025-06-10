import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "closed"],
        default: "open"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    priority: String,
    deadline: Date,
    helpfulNotes: String,
    relatedSkills: [
        String
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
})

export default mongoose.model("Ticket", ticketSchema)