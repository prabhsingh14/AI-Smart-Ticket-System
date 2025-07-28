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
    resolution: { //stores how the issue was solved
        type: String,
        default: ""
    },
    isResolved: { //to track resolution status
        type: Boolean,
        default: false
    },
    embeddings: { //store vector representation of the issue
        type: [Number],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

export default mongoose.model("Ticket", ticketSchema)