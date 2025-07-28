import Ticket from "../models/ticket.model.js";
import { getEmbeddings } from "../utils/embeddings.js";
import cosineSimilarity from "compute-cosine-similarity";

export const getTicketSuggestions = async(req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        if(!ticket) {
            return res.status(404).json({ error: "Ticket not found." });
        }

        const currEmbeddings = ticket.embeddings;

        // can be optimize by indexed and vector DB
        const allTickets = await Ticket.find({
            _id: { $ne: ticketId },
            embeddings: { $exists: true }
        });

        const scored = ticket.map(ticket => {
            const score = cosineSimilarity(currEmbeddings, ticket.embeddings);
            return { ticket, score };
        })

        scored.sort((a, b) => b.score - a.score);

        const topSuggestions = scored.slice(0, 3).map(({ ticket, score }) => ({
            _id: ticket._id,
            title: ticket.title,
            description: ticket.description,
            resolution: ticket.resolution,
            score: score.toFixed(3)
        }))

        return res.status(200).json({
            message: "Ticket suggestions fetched successfully.",
            topSuggestions
        })
    } catch (error) {
        console.error("Error while suggesting similar tickets:", error);
        return res.status(500).json({ 
            error: "An error occurred while suggesting..." 
        });
    }
}