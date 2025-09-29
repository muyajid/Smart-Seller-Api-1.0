import logger from "../../application/looger-app.js";
import prisma from "../../application/prisma-client-app.js";
import ResponseEror from "../../eror/response-eror.js";

async function getProduct(req) {
  logger.info("Proces started GET: api/v1/product?productName=");

  const productName = req.query.productName;

  let selectProduct;

  if (productName) {
    selectProduct = await prisma.product.findMany({
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

  logger.info(`Succesfully get data count: ${selectProduct.length}`);

  return selectProduct;
}

export default getProduct;
