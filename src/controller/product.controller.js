import { addProduct } from "../service/product.service.js"
async function controlAddProduct(req, res, next) {
    try {
        const product = await addProduct(req);

        res.status(200).json({
            message: "Product added successfully",
            data: {
                product: product,
            }
        });
    } catch (error) {
        next(error);
    }
}


export {
    controlAddProduct,
}