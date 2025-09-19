import { addProduct } from "../service/product.service.js";

async function addProductController(req, res, next) {
  try {
    const results = await addProduct(req);

    res.status(200).json({
      message: "Succesfullt add product",
      data: {
        id: results.productData.id,
        productName: results.productData.productName,
        description: results.productData.description,
        price: results.productData.price,
        stock: results.productData.stock,
        brand: results.productData.brand,
        kategori: results.productData.kategori,
        sku: results.productData.sku,
        createdAt: results.productData.createdAt,
        image: results.image,
      },
    });
  } catch (err) {
    next(err);
  }
};

export {
    addProductController,
}