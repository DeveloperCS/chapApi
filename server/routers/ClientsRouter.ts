import express from 'express';
const router = express.Router();
import AuthController from '../controllers/AuthController';
import { handleError } from '../controllers/ErrorHandlers';
import ClientsController from '../controllers/ClientsController';

const authController = new AuthController();
const clientsController = new ClientsController();

router.get('/:id', authController.checkAdminToken, (req, res) => {
    clientsController.get(req.params.id).then((client) => {
        res.json(client);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.get('', authController.checkSuperAdminToken, (req, res) => {
    clientsController.getAll().then((clients) => {
        res.json(clients);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.post('', authController.checkAdminToken, (req, res) => {
    clientsController.create(authController.getBaseUserFromRequest(req)).then((client) => {
        res.json(client);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.put('/:id', authController.checkAdminToken, (req, res) => {
    clientsController.update(req.params.id, authController.getBaseUserFromRequest(req)).then((client) => {
        res.json(client);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.delete('/:id', authController.checkAdminToken, (req, res) => {
    clientsController.delete(req.params.id).then(() => {
        res.json({
            id: req.params.id
        });
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.put('/:id/introduction', (req, res) => {
    clientsController.setIntroductionDone(req.params.id).then((client) => {
        res.json(client);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.put('/:id/tutorial', (req, res) => {
    clientsController.setTutorialDone(req.params.id).then((client) => {
        res.json(client);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

export default router;
