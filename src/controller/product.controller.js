import { addProduct, getProduct } from "../service/product.service.js";

async function addProductController(req, res, next) {
  try {
    const results = await addProduct(req);

    res.status(200).json({
      message: "Succesfully add product",
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
}

async function getProductController(req, res, next) {
  try {
    const results = await getProduct(req);

    res.status(200).json({
      message: "Succesfully get data",
      data: results,
      total: results.length,
    });
  } catch (err) {
    next(err);
  }
}

export { addProductController, getProductController };
