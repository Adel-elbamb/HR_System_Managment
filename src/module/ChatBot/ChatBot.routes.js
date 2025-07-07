import Router from "express";
import { chatBotController } from "./Controller/ChatBot.controller.js";
import validation from "../../middleware/validation.js";
import { chatBotSchema } from "./ChatBot.validation.js";

const router = Router();

router.post("/", validation(chatBotSchema), chatBotController);

export default router;
