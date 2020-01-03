import express from 'express';
const router = express.Router();
import MessagesController from '../controllers/MessagesController';
import { handleError } from '../controllers/ErrorHandlers';
import AuthController from '../controllers/AuthController';

const messagesController = new MessagesController();
const authController = new AuthController();

router.post('/:id', authController.checkClientToken, (req, res) => {
    messagesController.sendMessage(req.params.id, req.body.message).then((botMessage) => {
        res.json(botMessage);
    }).catch((error) => {
        handleError(error, res, 404);
    });
});

export default router;
