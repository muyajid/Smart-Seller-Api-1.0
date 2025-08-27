import logger from "../application/looger-app.js";
import ResponseEror from "../eror/response-eror.js";
import prisma from "../application/prisma-client-app.js";

async function addProduct(req) {
  const { namaProduk, deskripsi, hargaProduk, stokProduk, kategori } = req.body;

  logger.info(`Proces started /api/v1/product/add`);

  if (!namaProduk) {
    logger.warn(`Bad request missing required body fields`);
    throw new ResponseEror(`Bad request missing required body fields`, 400);
  }

  const findDuplicate = await prisma.product.findMany({
    where: { namaProduk: namaProduk },
  });

  if (findDuplicate.length > 0) {
    logger.warn(`Conflict product is already existing`);
    throw new ResponseEror(`Conflict product is already existing`, 409);
  }

  let createNewProduct;

  if (kategori && Array.isArray(kategori)) {
    logger.info(`Req.body contains kategori fields`);

    if (kategori.length === 0) {
      logger.warn(`Bad request kategori data cannot be empty`);
      throw new ResponseEror(`Bad request kategori data cannot be empty`, 400);
    }

    const validateObject = kategori.every((object) => {
      return (
        "atribut" in object &&
        "value" in object &&
        "harga" in object &&
        "stok" in object
      );
    });
    logger.info(`Validate property of kategori results ${validateObject}`);

    if (!validateObject || validateObject === false) {
      logger.warn(`Bad request missing required propety in kategori`);
      throw new ResponseEror(`Missing required property in kategori`, 400);
    }

    const totalStok = kategori.reduce((acc, currentValue) => {
      return acc + currentValue.stok;
    }, 0);
    logger.info(`Result of total stok calculation: ${totalStok}`);

    if (totalStok <= 0) {
      logger.warn(`Bad request stock property cannot be 0`);
      throw new ResponseEror(`Bad request stock property cannot be 0`, 400);
    }

    const hargaMinimum = kategori.reduce((acc, currentValue) => {
      return currentValue.harga < acc ? currentValue.harga : acc;
    }, kategori[0].harga);
    logger.info(`Result of lowest price search: ${hargaMinimum}`);

    createNewProduct = await prisma.product.create({
      data: {
        namaProduk: namaProduk,
        deskripsiProduk: deskripsi || null,
        hargaProduk: hargaMinimum,
        stokProduk: totalStok,
      },
    });

    const productId = createNewProduct.id;
    logger.info(`Product added succesfully productId: ${productId}`);

    const createNewCategory = await prisma.productKategori.createMany({
      data: kategori.map((object) => ({
        produkId: productId,
        atribut: object.atribut,
        value: object.value,
        stok: object.stok,
        harga: object.harga,
      })),
    });

    logger.info(`Category added succesfully: ${createNewCategory.count}`);
  } else {
    logger.info(`Req.body does not contains category`);

    if (hargaProduk === undefined || stokProduk === undefined) {
      logger.warn(`Bad request missing reuqired body fields`);
      throw new ResponseEror(`Bad request missing required body fields`, 400);
    }

    if (hargaProduk <= 0 || stokProduk <= 0) {
      logger.warn(`Bad request harga or stok cannot be 0`);
      throw new ResponseEror(`Bad request harga or stok cannot be 0`, 400);
    }

    createNewProduct = await prisma.product.create({
      data: {
        namaProduk: namaProduk,
        deskripsiProduk: deskripsi || null,
        hargaProduk: hargaProduk,
        stokProduk: stokProduk,
      },
    });

    logger.info(`Product added succesfully ${createNewProduct.id}`);
  }

  return {
    data: {
      id: createNewProduct.id,
      namaProduk: createNewProduct.namaProduk,
      deskripsi: createNewProduct.deskripsiProduk,
      hargaProduk: createNewProduct.hargaProduk,
      stokProduk: createNewProduct.stokProduk,
      kategori: kategori || [],
    },
  };
}

export { addProduct };
