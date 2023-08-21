const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
    getAllProducts,
    addProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    deleteProducts,
    getPublishedProducts,
    getProductByName,
    getProductsCSV,
    add,
} = require('../controllers/productController');

router.route('/')
.get(auth.isAuthenticated, auth.isAuthorizedRole, getAllProducts)
.post(auth.isAuthenticated, auth.isAuthorizedUser, addProducts)
.delete(auth.isAuthenticated, auth.isAuthorizedRole, deleteProducts)

router.route('/:id')
.get(auth.isAuthenticated, auth.isAuthorizedRole, getProductById)
.put(auth.isAuthenticated, auth.isAuthorizedRole, updateProductById)
.delete(deleteProductById)

router.route('/product/published')
.get(auth.isAuthenticated, auth.isAuthorizedRole, getPublishedProducts)

router.route('/product/byname/?')
.get(auth.isAuthenticated, auth.isAuthorizedRole, getProductByName)

router.route('/upload/product/').get(getProductsCSV) 

router.route('/add').post(auth.isAuthenticated,  add)

module.exports = router;