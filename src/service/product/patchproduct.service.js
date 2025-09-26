import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import path from "path";
import fs from "fs";
import urlGenerator from "../../utility/url-generator-utility.js";

async function patchProduct(req) {
  logger.info("Proces started PATCH: /api/v1/product");

  const productId = req.query.productId;

  if (!productId) {
    logger.warn("Proces failed: missing required query param 'productId'");
    throw new ResponseEror("Missing required query param 'productId'", 400);
  }

  const findProduct = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    include: {
      Images: true,
    },
  });

  if (!findProduct) {
    logger.warn("Proces failed: product not found");
    throw new ResponseEror("Product Not Found", 404);
  }
  logger.info(`Product found: ${findProduct.productName} (${findProduct.id})`);

  const body = { ...req.body };
  logger.info(`Request Body: ${JSON.stringify(body)})}`);

  if (
    body.productName != undefined &&
    (body.productName === "" || body.productName === null)
  ) {
    logger.warn("Validation failed: productName cannot be empty or null");
    throw new ResponseEror("Product name cannot be empty or null", 400);
  }

  if (body.price != undefined) {
    const priceToFloat = parseFloat(body.price);

    if (isNaN(priceToFloat) || priceToFloat <= 1000) {
      logger.warn("Validation failed: price must be a number > 1000");
      throw new ResponseEror("Price must be a number greater than 1000", 400);
    }
    body.price = priceToFloat;
  }

  if (body.stock != undefined) {
    const stockToInt = parseInt(body.stock);

    if (isNaN(stockToInt) || stockToInt <= 0) {
      logger.warn("Validation failed: stock must be a number > 0");
      throw new ResponseEror("Stock must be a number greated than 0", 400);
    }
    body.stock = stockToInt;
  }

  if (req.files && req.files.length !== 0) {
    logger.info(`Detected image update count: [${req.files.length}]`);

    const pathLocation = path.join(process.cwd(), "images");
    const imagesData = req.files;

    for (const oldImages of findProduct.Images) {
      const oldImagesName = path.basename(oldImages.imageUrl);
      const oldImageLocation = path.join(pathLocation, oldImagesName);

      try {
        await fs.promises.unlink(oldImageLocation);
        logger.info(`Old image deleted: ${oldImageLocation}`);
      } catch (err) {
        logger.warn(`Failed to delete old image: ${oldImageLocation}`);
        throw new ResponseEror("Failed to update image", 500);
      }

      await prisma.images.delete({
        where: {
          id: oldImages.id,
        },
      });
      logger.info(`Old image URL deleted from db: ${oldImages.id}`);
    }

    for (const newImages of imagesData) {
      const metaData = urlGenerator(req, "images", newImages.originalname);

      const newImagesLocation = path.join(pathLocation, metaData.imageName);
      try {
        await fs.promises.writeFile(newImagesLocation, newImages.buffer);
        logger.info(`New image written to disk: ${metaData.imageName}`);
      } catch (err) {
        logger.warn(`Failed to write new image: ${metaData.imageName}`);
        throw new ResponseEror("Failed to update image", 500);
      }

      await prisma.images.create({
        data: {
          productId: findProduct.id,
          imageUrl: metaData.imageUrl,
        },
      });
      logger.info(`New image URL writen to db ${metaData.imageUrl}`);
    }
  }

  if (Object.keys(body).length === 0) {
    if (req.files && req.files.length > 0) {
      logger.info("No product fields updated, only image were updated");

      return await prisma.product.findFirst({
        where: {
          id: findProduct.id,
        },
        include: {
          Images: true,
        },
      });
    }

    logger.info("Proces failed: no fields or image sent to update");
    throw new ResponseEror("No fields or image sent to update", 400);
  }

  const patchProduct = await prisma.product.update({
    where: {
      id: findProduct.id,
    },
    data: body,
    include: {
      Images: true,
    },
  });

  logger.info(`Succesfuly update product: ${patchProduct.id}`);
  return patchProduct;
}

export default patchProduct;
