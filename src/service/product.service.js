import logger from "../application/looger-app.js";
import prisma from "../application/prisma-client-app.js";
import ResponseEror from "../eror/response-eror.js";
import path from "path";
import fs from "fs";

async function addProduct(req) {
  logger.info("Proces started /api/v1/product/add");

  const { productName, description, price, stock, brand, kategory, sku } =
    req.body;

  if (!productName || !price || !stock) {
    logger.warn("Proces failed missing required body fields");
    throw new ResponseEror("Missing required body fields", 400);
  }

  const priceToFloat = parseFloat(price);
  const stockToInt = parseInt(stock);

  if (priceToFloat <= 1000 || stockToInt <= 0) {
    logger.warn(
      "Proces failed price cannot be 1000 and stock cannot be 0",
      400
    );
    throw new ResponseEror("Price cannot be 1000 and stock cannot be 0");
  }

  const createNewProduct = await prisma.product.create({
    data: {
      productName: productName,
      description: description || "no description",
      price: priceToFloat,
      stock: stockToInt,
      brand: brand || "no brand",
      kategori: kategory || "no kategory",
      sku: sku || "no sku",
    },
  });

  const productId = createNewProduct.id;
  logger.info(`Succesfully create new product product id: ${productId}`);

  const imagesData = req.files;
  logger.info(`Images file length: ${imagesData.length}`);

  if (imagesData.length <= 0) {
    logger.warn("Proces failed missing images data");
    throw new ResponseEror("Missing images data", 400);
  }
  const imagesUrlData = [];

  for (const images of imagesData) {
    const modifiedImagesName =
      Date.now().toString() + "-" + images.originalname;

    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/images/${modifiedImagesName}`;

    await prisma.images.create({
      data: {
        productId: productId,
        imageUrl: imageUrl,
      },
    });

    imagesUrlData.push(imageUrl);

    const imageLocation = path.join(
      process.cwd(),
      "images",
      modifiedImagesName
    );
    fs.writeFileSync(imageLocation, images.buffer);
  }
  logger.info("Succesfully add product images data: " + imagesUrlData);

  return {
    productData: createNewProduct,
    image: imagesUrlData,
  };
}

export {
    addProduct,
};