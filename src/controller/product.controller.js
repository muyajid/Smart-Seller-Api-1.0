import { addProduct } from "../service/product.service.js";

async function addProductController(req, res, next) {
    try {
        const results = await addProduct(req);
        res.status(200).json({
            message: `Product added succesfully`,
            data: results.data
        });
    } catch (err) {
        next(err);
    }
}

export {
    addProductController,
}