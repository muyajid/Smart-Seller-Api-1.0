import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import path from "path";
import fs from "fs";

async function deleteProduct(req) {
  logger.info("Proces started DELETE: /api/v1/product?id=");
  const productId = req.query.id;

  if (!productId) {
    logger.warn("Proces failed: missing required query param");
    throw new ResponseEror("Missing required query param", 400);
  }

  const findProduct = await prisma.product.findFirst({
    where: { id: productId },
    include: { Images: true },
  });

  if (!findProduct) {
    logger.warn("Proces failed: product not found");
    throw new ResponseEror("Product Not Found", 404);
  }
  logger.info(`Product found ${findProduct.productName} (${findProduct.id})`);

  let remove;
  try {
    remove = await prisma.product.delete({
      where: { id: findProduct.id },
      include: { Images: true },
    });
    logger.info(`Succesfuly remove product record in db: ${remove.id}`);

    const pathLocation = path.join(process.cwd(), "images");
    for (const imageFromDisk of remove.Images) {
      const imagesName = path.basename(imageFromDisk.imageUrl);
      const imagesPath = path.join(pathLocation, imagesName);

      await fs.promises.unlink(imagesPath);
      logger.info(`Image deleted from disk ${imagesName}`);
    }
  } catch (error) {
    logger.warn(`Failed remove image from disk ${error.message}`);
    throw new ResponseEror(`Failed to remove product.`, 500);
  }

  logger.info(`Product removed succesfully productId: ${remove.id}`);
  return remove;
}

export default deleteProduct;
