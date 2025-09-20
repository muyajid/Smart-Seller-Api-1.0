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

  const productName = req.query.productName;
  let selectProduct;
  if (productName) {
    selectProduct = await prisma.product.findFirst({
      where: {
        productName: {
          contains: productName,
        },
      },
      include: { Images: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    selectProduct = await prisma.product.findMany({
      include: { Images: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!selectProduct) {
    logger.warn("Proces failed empty product data");
    throw new ResponseEror("Product not found", 404);
  }

  logger.info(`Succesfully get data: ${JSON.stringify(selectProduct)}`);

  return selectProduct;
}

async function deleteProduct(req) {

  logger.info("Proces started api/v1/product/delete");
  const productId = req.query.id;

  if (!productId) {
    logger.warn("Proces failed missing required query param");
    throw new ResponseEror("Missing required query param", 400);
  };

  const findProduct = await prisma.product.findFirst({
    where: {id: productId},
    include: {Images: true}
  });

  if (!findProduct) {
    logger.warn("Proces failed product not found");
    throw new ResponseEror("Product Not Found", 404);
  };

    const remove = await prisma.product.delete({
    where: {id: productId},
    include: {Images: true},
  });

  for (const images of remove.Images) {
    const fileName = path.basename(images.imageUrl);
    const filePath = path.join(path.join(process.cwd(), "images"), fileName);

    await fs.promises.unlink(filePath);
  }

  logger.info(`Product removed succesfully productId: ${remove.id}`);
  return remove;
}
export { addProduct, getProduct, deleteProduct };
