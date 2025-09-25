import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import urlGenerator from "../../utility/url-generator-utility.js";
import path from "path";
import fs from "fs";

async function patchProduct(req) {
  logger.info("Proces started /api/v1/product/patch");

  const productId = req.query.productId;

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
    throw new ResponseEror("Product not found", 404);
  }

  logger.info(`Product Found In Database : ${findProduct}`);

  const body = { ...req.body };
  logger.info(`Body data: ${JSON.stringify(body)}`);

  if (
    body.productName &&
    (body.productName === "" || body.productName === null)
  ) {
    logger.warn("Proces failed productName cannot be empty or null");
    throw new ResponseEror("productName cannot be empty or null", 400);
  }

  if (body.price) {
    const priceToFloat = parseFloat(body.price);

    if (isNaN(priceToFloat) || priceToFloat <= 1000) {
      logger.warn(
        "Proces failed price cannot be <= 1000 and price must be number"
      );
      throw new ResponseEror(
        "price cannot be <= 1000 and price must be number",
        400
      );
    }
    body.price = priceToFloat;
  }

  if (body.stock) {
    const stockToInt = parseInt(body.stock);

    if (isNaN(stockToInt) || stockToInt <= 0) {
      logger.warn(
        "Proces failed stock cannot be <= 0 and stock must be number"
      );
      throw new ResponseEror("stock cannot be <= 0 an stock mu be number", 400);
    }
    body.stock = stockToInt;
  }

  if (req.files) {
    logger.info("Client request update image");

    if (req.files.length <= 0) {
      logger.warn("Proces failed image data cannot be empty");
      throw new ResponseEror("Image data cannot be empty", 400);
    }
    const imageFromDB = findProduct.Images;
    const pathLocation = path.join(process.cwd(), "images");

    // Delete old image
    logger.info("Delete old image proces from disk started");
    for (const oldImages of imageFromDB) {
      const oldImagesName = path.basename(oldImages.imageUrl);
      const oldImagesLocation = path.join(pathLocation, oldImagesName);

      await fs.promises.unlink(oldImagesLocation);

      await prisma.images.delete({
        where: {
          id: oldImages.id,
        },
      });
    }

    // Create new image
    logger.info("Create new image proces started");
    for (const newImage of req.files) {
      const imagesMetaData = urlGenerator(req, "images", newImage.originalname);
      const newImageName = imagesMetaData.imageName;
      const newImageUrl = imagesMetaData.imageUrl;

      const newImagesLocation = path.join(folderLocation, newImageName);

      await fs.promises.writeFile(newImagesLocation);

      await prisma.images.create({
        data: {
          productId: productId,
          imageUrl: newImageUrl,
        },
      });
    }
  }

  if (Object.keys(body).length === 0) {
    logger.info("Body request not found");
    return await prisma.product.findFirst({
      where: {
        id: productId,
      },
      include: {
        Images: true,
      },
    });
  }

  const patchProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: body,
    include: {
      Images: true,
    },
  });

  return patchProduct;
};

export default patchProduct;