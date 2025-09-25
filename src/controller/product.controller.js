import addProduct from "../service/product/addproduct.service.js";
import deleteProduct from "../service/product/deleteproduct.service.js";
import getProduct from "../service/product/getproduct.service.js";
import patchProduct from "../service/product/patchproduct.service.js";

async function addProductController(req, res, next) {
  try {
    const results = await addProduct(req);

    res.status(200).json({
      message: "Succesfully add product",
      data: results,
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

async function deleteProductController(req, res, next) {
  try {
    const results = await deleteProduct(req);

    res.status(200).json({
      message: "Succesfully remove product",
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

async function patchProductController(req, res, next) {
  try {
    const results = await patchProduct(req);

    res.status(200).json({
      message: "Succesfully patch product",
      data: results,
    });
  } catch (err) {
    next(err);
  }
}
export {
  addProductController,
  getProductController,
  deleteProductController,
  patchProductController,
}
