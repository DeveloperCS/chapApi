import express from 'express';
const router = express.Router();
import AuthController from '../controllers/AuthController';
import { handleError } from '../controllers/ErrorHandlers';
import AdminsController from '../controllers/AdminsController';

const authController = new AuthController();
const adminsController = new AdminsController();

router.get('/:id', authController.checkSuperAdminToken, (req, res) => {
    adminsController.get(req.params.id).then((admin) => {
        res.json(admin);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.get('', authController.checkSuperAdminToken, (req, res) => {
    if (req.query.office !== undefined) {
        adminsController.getByOffice(req.query.office).then((admins) => {
            res.json(admins);
        }).catch(error => {
            handleError(error, res, 403);
        });
    } else {
        adminsController.getAll().then((admins) => {
            res.json(admins);
        }).catch(error => {
            handleError(error, res, 403);
        });
    }
});

router.post('', authController.checkSuperAdminToken, (req, res) => {
    adminsController.create(authController.getBaseUserFromRequest(req)).then((admin) => {
        res.json(admin);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.put('/:id', authController.checkSuperAdminToken, (req, res) => {
    adminsController.update(req.params.id, authController.getBaseUserFromRequest(req)).then((admin) => {
        res.json(admin);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.delete('/:id', authController.checkSuperAdminToken, (req, res) => {
    adminsController.delete(req.params.id).then(() => {
        res.json({
            id: req.params.id
        });
    }).catch(error => {
        handleError(error, res, 403);
    });
});

export default router;
