import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import path from "path";
import fs from "fs";
import urlGenerator from "../../utility/url-generator-utility.js";

async function patchProduct(req) {
  logger.info("Proces started PATCH: /api/v1/product");

  const productId = req.query.productId;

  if (!productId) throw new ResponseEror("Missing required query param", 400);

  const findProduct = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    include: {
      Images: true,
    },
  });

  if (!findProduct) {
    logger.warn("Proces failed product not found");
    throw new ResponseEror("Product Not Found", 404);
  }
  logger.info(`Product found product name: ${findProduct.productName}`);

  const body = { ...req.body };
  logger.info(`Body Request Data: ${JSON.stringify(body)})}`)

  if (
    body.productName != undefined &&
    (body.productName === "" || body.productName === null)
  ) {
    logger.warn("Proces failed product name cannot be empty or null");
    throw new ResponseEror("Product name cannot be empty or null", 400);
  }

  if (body.price != undefined) {
    const priceToFloat = parseFloat(body.price);

    if (isNaN(priceToFloat) || priceToFloat <= 1000) {
      logger.warn(
        "Proces failed price cannot be less than 1000 and price must be number"
      );
      throw new ResponseEror(
        "Price cannot be le less than 1000 and price must be number",
        400
      );
    }
    body.price = priceToFloat;
  }

  if (body.stock != undefined) {
    const stockToInt = parseInt(body.stock);

    if (isNaN(stockToInt) || stockToInt <= 0) {
      logger.warn(
        "Proces failed stock cannot be empty and stock must be number"
      );
      throw new ResponseEror(
        "Stock cannot be empty and stock must be number",
        400
      );
    }
    body.stock = stockToInt;
  }

  if (req.files && req.files.length !== 0) {
    logger.info(`Image update detected image length ${req.files.length}`);

    const pathLocation = path.join(process.cwd(), "images");
    const imagesData = req.files;

    for (const oldImages of findProduct.Images) {
      const oldImagesName = path.basename(oldImages.imageUrl);
      const oldImageLocation = path.join(pathLocation, oldImagesName);

      try {
        await fs.promises.unlink(oldImageLocation);
      } catch (err) {
        logger.warn(`eror unlink images: ${err.message}`);
        throw new ResponseEror("Un Succesfully Update Images", 500);
      }

      await prisma.images.delete({
        where: {
          id: oldImages.id,
        },
      });
    }

    for (const newImages of imagesData) {
      const metaData = urlGenerator(req, "images", newImages.originalname);

      const newImagesLocation = path.join(pathLocation, metaData.imageName);
      try {
        await fs.promises.writeFile(newImagesLocation, newImages.buffer);
      } catch (err) {
        logger.warn(`eror writefile images: ${err.message}`);
        throw new ResponseEror("Un Succesfullt Update Images", 500);
      }

      await prisma.images.create({
        data: {
          productId: findProduct.id,
          imageUrl: metaData.imageUrl,
        },
      });
    }
  }

  if (Object.keys(body).length === 0) {
    logger.info(`Body Data Not Found`);
    return await prisma.product.findFirst({ where: { id: findProduct.id } });
  }

  const patchProduct = await prisma.product.update({
    where: {
      id: findProduct.id,
    },
    data: body
  });

  return patchProduct;
}

export default patchProduct;
