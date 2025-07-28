import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";
import { getEmbeddings } from "../utils/embeddings.js";
import cosineSimilarity from "compute-cosine-similarity";

/*Creates a new ticket, triggers an Inngest function for ticket creation
Generate and store embeddings
*/

export const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        const embeddings = await getEmbeddings(`${title} ${description}`);

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required." });
        }

        const newTicket = await Ticket.create({
            title,
            description,
            embeddings,
            createdBy: req.user._id.toString(),
        });

        // Trigger the Inngest function for ticket creation
        await inngest.send({
            name: "ticket/created",
            data: { 
                ticketId: newTicket._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString(),
            },
        })

        return res.status(201).json({ 
            message: "Ticket created successfully.", 
            ticket: newTicket 
        });
    } catch (error) {
        console.error("Error creating ticket:", error);
        return res.status(500).json({ error: "An error occurred while creating the ticket." });
    }
}

// Get all tickets
export const getTickets = async (req, res) => {
    try {
        const user = req.user
        let tickets = [];
        if (user.role !== "user") {
            tickets = await Ticket.find().populate("assignedTo", ["email", "_id"]).sort({ createdAt: -1 });
        } else{
            await Ticket.find({ createdBy: user._id })
                    .select("title description status createdAt")
                    .sort({ createdAt: -1 })
        }

        return res.status(200).json({
            message: "Tickets fetched successfully.",
            tickets
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
}

// Get a single ticket
export const getTicket = async (req, res) => {
    try {
        const user = req.user;
        let ticket;

        if(user.role !== "user"){
            ticket = await Ticket.findById(req.params.id)
                .populate("assignedTo", ["email", "_id"])
        } else{
            ticket = await Ticket.findOne({ _id: req.params.id, createdBy: user._id })
                .select("title description status createdAt")
        }

        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found." });
        }

        return res.status(200).json({
            message: "Ticket fetched successfully.",
            ticket
        })
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return res.status(500).json({ error: "An error occurred while fetching the ticket." });
    }
}

export const getSimilarTickets = async(req, res) => {
    try {
        const {title, description} = req.body;
        const queryEmbeddings = await getEmbeddings(`${title} ${description}`);
        const tickets = await Ticket.find({
            embeddings: { $exists: true }
        });

        // similarity score for each ticket
        const scored = tickets.map(ticket => {
            const score = cosineSimilarity(queryEmbeddings, ticket.embeddings);
            return { ticket, score };
        })

        // sort in desc, take top 3
        const topMatches = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ ticket, score }) => ({
                _id: ticket._id,
                title: ticket.title,
                description: ticket.description,
                resolution: ticket.resolution,
                score: score.toFixed(3)
            }));
        
        return res.status(200).json({
            message: "Similar tickets fetched successfully.",
            topMatches
        })
    } catch (error) {
        console.error("Error fetching similar tickets:", error);
        return res.status(500).json({ 
            error: "An error occurred while fetching similar tickets." 
        });
    }
}