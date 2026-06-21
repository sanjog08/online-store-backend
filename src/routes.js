import { Router } from 'express';
import { authenticate } from './middlewares/auth.js';
import { requireRole } from './middlewares/role.js';
import { getHealth } from './controllers/health.controller.js';
import authController from './controllers/auth.controller.js';
import userController from './controllers/user.controller.js';
import adminRequestController from './controllers/adminRequest.controller.js';
import productController from './controllers/product.controller.js';
import mediaController from './controllers/media.controller.js';
import upload from './middlewares/upload.js';
import newProductController from './controllers/newProduct.controller.js';
import todaysOfferController from './controllers/todaysOffer.controller.js';
import aboutUsController from './controllers/aboutUs.controller.js';

const router = Router();

// ─── Home (public) ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 E-Commerce API is up and running 24x7, deployed on Vercel.',
    status: 'online',
  });
});

// ─── Health ─────────────────────────────────────────────────────────────────
router.get('/health', getHealth);

// ─── Auth (public) ───────────────────────────────────────────────────────────
router.post('/auth/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/auth/login', (req, res, next) => authController.login(req, res, next));
router.post('/auth/logout', (req, res, next) => authController.logout(req, res, next));

// ─── Admin Requests ──────────────────────────────────────────────────────────
// Customer: apply to become admin
router.post('/admin-requests',
  authenticate,
  requireRole('customer'),
  (req, res, next) => adminRequestController.apply(req, res, next)
);

// Admin: list all requests (filter with ?status=pending|approved|rejected)
router.get('/admin-requests',
  authenticate,
  requireRole('admin'),
  (req, res, next) => adminRequestController.list(req, res, next)
);

// Admin: approve or reject a request — body: { action: 'approve' | 'reject' }
router.put('/admin-requests/:id',
  authenticate,
  requireRole('admin'),
  (req, res, next) => adminRequestController.review(req, res, next)
);

// Customer: withdraw their own pending admin request
router.delete('/admin-requests/:id',
  authenticate,
  requireRole('customer'),
  (req, res, next) => adminRequestController.withdraw(req, res, next)
);

// ─── Users ───────────────────────────────────────────────────────────────────
// Admin: list all users (filter with ?role=customer|admin)
router.get('/users',
  authenticate,
  requireRole('admin'),
  (req, res, next) => userController.getAll(req, res, next)
);

// get single user
router.get('/users/:id',
  authenticate,
  requireRole('admin', 'customer'),
  (req, res, next) => userController.getOne(req, res, next)
);

// Admin: create a user directly
router.post('/users',
  authenticate,
  requireRole('admin'),
  (req, res, next) => userController.create(req, res, next)
);

// Admin: update a user's profile
router.put('/users/:id',
  authenticate,
  requireRole('admin', 'customer'),
  (req, res, next) => userController.update(req, res, next)
);

// Admin: directly promote a user to admin
router.put('/users/:id/make-admin',
  authenticate,
  requireRole('admin'),
  (req, res, next) => userController.makeAdmin(req, res, next)
);

// Admin: delete a user
router.delete('/users/:id',
  authenticate,
  requireRole('admin'),
  (req, res, next) => userController.delete(req, res, next)
);

// ─── Products ────────────────────────────────────────────────────────────────
// Public: list all products (filter with ?category=&brand=)
router.get('/products',
  (req, res, next) => productController.getAll(req, res, next)
);

// Public: get a single product
router.get('/products/:id',
  (req, res, next) => productController.getOne(req, res, next)
);

// Admin: create a new product
router.post('/products',
  authenticate,
  requireRole('admin'),
  (req, res, next) => productController.create(req, res, next)
);

// Admin: update a product
router.put('/products/:id',
  authenticate,
  requireRole('admin'),
  (req, res, next) => productController.update(req, res, next)
);

// Admin: delete a product
router.delete('/products/:id',
  authenticate,
  requireRole('admin'),
  (req, res, next) => productController.delete(req, res, next)
);

// ─── Media ────────────────────────────────────────────────────────────────────
// Admin: upload one or more files to Cloudinary (form-data field: 'files')
router.post('/media/upload',
  authenticate,
  requireRole('admin'),
  upload.array('files', 10),
  (req, res, next) => mediaController.upload(req, res, next)
);

// Admin: delete a file from Cloudinary
// Body: { publicId: string, resourceType?: 'image' | 'video' }
router.delete('/media',
  authenticate,
  requireRole('admin'),
  (req, res, next) => mediaController.delete(req, res, next)
);


// ─── New Products ──────────────────────────────────────────────────
// Public: get the new products list (full product data)
router.get('/new-products', (req, res, next) => newProductController.get(req, res, next));

// Admin: replace entire list
router.post('/new-products', authenticate, requireRole('admin'), (req, res, next) => newProductController.set(req, res, next));

// Admin: add product(s) to the list
router.put('/new-products', authenticate, requireRole('admin'), (req, res, next) => newProductController.add(req, res, next));

// Admin: remove product(s) from the list
router.delete('/new-products', authenticate, requireRole('admin'), (req, res, next) => newProductController.remove(req, res, next));

// ─── Today's Offer ───────────────────────────────────────────────
// Public: get today's offer list (full product data)
router.get('/todays-offer', (req, res, next) => todaysOfferController.get(req, res, next));

// Admin: replace entire list
router.post('/todays-offer', authenticate, requireRole('admin'), (req, res, next) => todaysOfferController.set(req, res, next));

// Admin: add product(s) to the list
router.put('/todays-offer', authenticate, requireRole('admin'), (req, res, next) => todaysOfferController.add(req, res, next));

// Admin: remove product(s) from the list
router.delete('/todays-offer', authenticate, requireRole('admin'), (req, res, next) => todaysOfferController.remove(req, res, next));

// ─── About Us ─────────────────────────────────────────────────────────────────
// Public: get the about us document
router.get('/about-us', (req, res, next) => aboutUsController.get(req, res, next));

// Admin: create the about us document (first time setup)
router.post('/about-us', authenticate, requireRole('admin'), (req, res, next) => aboutUsController.create(req, res, next));

// Admin: update the about us document (partial or full)
router.put('/about-us', authenticate, requireRole('admin'), (req, res, next) => aboutUsController.update(req, res, next));

// Admin: delete the about us document
router.delete('/about-us', authenticate, requireRole('admin'), (req, res, next) => aboutUsController.remove(req, res, next));

export default router;
