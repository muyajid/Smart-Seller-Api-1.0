import logger from "../application/looger-app.js";
import prisma from "../application/prisma-client-app.js";
import ResponseEror from "../eror/response-eror.js";
import path from "path";
import fs, { existsSync } from "fs";
import crypto from "crypto";

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

  if (isNaN(priceToFloat) || isNaN(stockToInt)) {
    logger.warn("Proces failed price adn stok must be number");
    throw new ResponseEror("Price and stock must be number", 400);
  }

  if (priceToFloat <= 1000 || stockToInt <= 0) {
    logger.warn("Proces failed price cannot be 1000 and stock cannot be 0");
    throw new ResponseEror("Price cannot be 1000 and stock cannot be 0", 400);
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

  const folderLocation = path.join(process.cwd(), "images");
  if (!existsSync(folderLocation)) {
    fs.mkdirSync(folderLocation, { recursive: true });
    logger.info(`Images folder succesfullt created`);
  }

  for (const images of imagesData) {
    const randomCharacter = crypto.randomBytes(5).toString("hex");
    const ext = path.extname(images.originalname);
    const modifiedImagesName = `${randomCharacter}-${Date.now()}${ext}`;

    const imageLocation = path.join(folderLocation, modifiedImagesName);

    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/images/${modifiedImagesName}`;

    await prisma.images.create({
      data: {
        productId: productId,
        imageUrl: imageUrl,
      },
    });

    await fs.promises.writeFile(imageLocation, images.buffer);

    imagesUrlData.push(imageUrl);
  }
  logger.info("Succesfully add product images data: " + imagesUrlData);

  return {
    productData: createNewProduct,
    image: imagesUrlData,
  };
}

async function getProduct(req) {
  logger.info("Proces started /api/v1/product");

  const selectProduct = await prisma.product.findMany({
    include: {Images: true,}
  });

  if (selectProduct.length <= 0) {
    logger.warn("Proces failed empty product data");
    throw new ResponseEror("Product data is empty", 404);
  };

  logger.info(`Succesfully get data: ${selectProduct.length}`);

  return selectProduct;
}

export { addProduct, getProduct };
