import { inngest } from "../client.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/aiAgent.js";

export const onTicketCreated = inngest.createFunction(
    { id: "on-ticket-created", retries: 2 },
    { event: "ticket/created" },
    async ({ event, step }) => {
        try {
            const { ticketId } = event.data

            // fetch ticket
            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObj = await Ticket.findById(ticketId);
                if (!ticketObj) {
                    throw new NonRetriableError("Ticket not found");
                }

                return ticketObj;
            });

            //  update ticket status to TODO
            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, {
                    status: "TODO"
                });
            })

            const aiResponse = await analyzeTicket(ticket)

            // running AI processing
            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = []
                if(!aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills
                    })

                    skills = aiResponse.relatedSkills
                }

                return skills
            })

            // assign a moderator based on related skills
            const moderator = await step.run("assign-moderator", async () => {
                let user = await User.findOne({ 
                    role: "moderator",
                    skills: {
                        $elemMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i"
                        }
                    }
                });

                if(!user){
                    await User.findOne({ role: "admin" })
                }

                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null,
                });

                return user;
            })

            // send email notification to the moderator
            await step.run("send-email-notification", async () => {
                if(moderator){
                    const finalTicket = await Ticket.findById(ticket._id)
                    await sendEmail(
                        moderator.email,
                        "New Ticket Assigned",
                        `A new ticket is assigned to you: ${finalTicket.title}`
                    )
                }
            })

            return {
                success: true,
                ticket: {
                    id: ticket._id,
                    title: ticket.title,
                    assignedTo: moderator?._id || null
                }
            };
        } catch (error) {
            console.error("Error in onTicketCreated function:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
)