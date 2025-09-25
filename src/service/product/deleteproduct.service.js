import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";
import path from "path";
import fs from "fs";

async function deleteProduct(req) {

  logger.info("Proces started api/v1/product/delete");
  const productId = req.query.id;

  if (!productId) {
    logger.warn("Proces failed missing required query param");
    throw new ResponseEror("Missing required query param", 400);
  }

  const findProduct = await prisma.product.findFirst({
    where: { id: productId },
    include: { Images: true },
  });

  if (!findProduct) {
    logger.warn("Proces failed product not found");
    throw new ResponseEror("Product Not Found", 404);
  }

  const remove = await prisma.product.delete({
    where: { id: productId },
    include: { Images: true },
  });

  const pathLocation = path.join(process.cwd(), "images");
  for (const images of remove.Images) {
    const fileName = path.basename(images.imageUrl);
    const filePath = path.join(pathLocation, fileName);

    await fs.promises.unlink(filePath);
  }

  logger.info(`Product removed succesfully productId: ${remove.id}`);
  return remove;
};

export default deleteProduct;