import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import urlGenerator from "../../utility/url-generator-utility.js";
import path from "path";
import fs, { existsSync } from "fs";

async function addProduct(req) {
  logger.info("Proces started POST: /api/v1/product");

  const { productName, description, price, stock, brand, kategory, sku } =
    req.body;

  if (!productName || !price || !stock) {
    logger.warn("Proces failed: required body fields incomplete");
    throw new ResponseEror(
      "Required body fields incomplete 'productName, price, stock'",
      400
    );
  }

  const priceToFloat = parseFloat(price);
  const stockToInt = parseInt(stock);

  if (priceToFloat <= 1000 || isNaN(priceToFloat)) {
    logger.warn("Proces failed: price must be number > 1000");

    throw new ResponseEror("Price must be a number greater than 1000", 400);
  } else if (stockToInt <= 0 || isNaN(stockToInt)) {
    logger.warn("Proces failed: stock must be number > 0");

    throw new ResponseEror("Stock must be a number greater than 0", 400);
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
  logger.info(`Product added succesfuly to db: ${productId}`);

  const imagesData = req.files;
  logger.info(`Image data count: ${imagesData.length}`);

  if (imagesData.length <= 0) {
    logger.warn("Proces failed: missing images data");
    throw new ResponseEror("Missing images data", 400);
  }
  const imagesUrlData = [];

  const folderLocation = path.join(process.cwd(), "images");
  if (!existsSync(folderLocation)) {
    fs.mkdirSync(folderLocation, { recursive: true });
    logger.info(`Path for saving images created succesfully ${folderLocation}`);
  }

  for (const images of imagesData) {
    const imagesMetaData = urlGenerator(req, "images", images.originalname);

    await prisma.images.create({
      data: {
        productId: productId,
        imageUrl: imagesMetaData.imageUrl,
      },
    });
    logger.info(`New image URL writen to db: ${imagesMetaData.imageUrl}`);

    const imageLocation = path.join(folderLocation, imageName);
    await fs.promises.writeFile(imageLocation, images.buffer);

    try {
      const imageLocation = path.join(folderLocation, imagesMetaData.imageName);
      await fs.promises.writeFile(imageLocation, images.buffer);

      logger.info(`New image writen to disk: ${imagesMetaData.imageName}`);
    } catch (err) {
      logger.warn(`Failed to write image to disk ${imagesMetaData.imageName}`);

      await prisma.product.delete({
        where: { id: productId },
        include: { Images: true },
      });

      throw new ResponseEror("Failed to add product", 500);
    }

    imagesUrlData.push(imageUrl);
  }
  logger.info(`Succesfuly add product ${productId}`);

  return {
    productData: createNewProduct,
    image: imagesUrlData,
  };
}

export default addProduct;
