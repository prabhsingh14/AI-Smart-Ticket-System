import { NonRetriableError } from "inngest";
import User from "../../models/user.model.js";
import { inngest } from "../client.js";
import { sendEmail } from "../../utils/mailer.js";

export const onSignup = inngest.createFunction(
    { id: "on-user-signup", retries: 2 },
    { event: "user/signup" },

    async({event, step}) => {
        try {
            const { email } = event.data;
            const user = await step.run("get-user-email", async () => {
                const userObj = await User.findOne({ email })
                if(!userObj){
                    throw new NonRetriableError(`User with email ${email} not found`);
                }

                return userObj;
            });

            await step.run("send-welcome-email", async () => {
                const subject = "Welcome to AI Ticket Assistant";
                const message = `Hello ${user.email},\n\nThank you for signing up for AI Ticket Assistant! We're excited to have you on board.
                \n\nBest regards,\nAI Ticket Assistant Team`;

                await sendEmail(user.email, subject, message);
                console.log(`Welcome email sent to ${user.email}`);
            });

            return { success: true, user: user.email };
        } catch (error) {
            console.error("Error in onSignup function:", error);
            return { success: false, error: error.message };
        }
    }
)