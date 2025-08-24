import logger from "../application/looger-app.js";
import ResponseEror from "../eror/response-eror.js";
import prisma from "../application/prisma-client-app.js";
async function addProduct(req) {
  const { namaProduk, deskripsi, harga, stok, kategori} = req.body;

  if (!namaProduk) {
    console.error(`Bad request missing required body fields`);
    throw new ResponseEror(`Bad request missing required body fields`, 400);
  };

  const findDuplicate = await prisma.product.findFirst({
    where: {
      namaProduk: namaProduk,
    }
  });

  if (findDuplicate) {
    console.error(`Conflict product is already existing`);
    throw new ResponseEror(`Conflict product is already existing`, 409);
  };

  let totalStok = 0;  
  let hargaMinimun = 0;
  
  let createNewProduct;

  if (kategori && Array.isArray(kategori)) {
    const checkProperty = kategori.every(object => {
      return "atribut" in object && "value" in object && "harga" in object && "stok" in object
    });

    if (!checkProperty || checkProperty === false) {
      console.error(`Missing required property in kategori data`);
      throw new ResponseEror(`Missing required property in kategori data`, 400);
    };

    totalStok = kategori.reduce((acc, currentValue) => {
      return acc + currentValue.stok;
    }, 0);

    hargaMinimun = kategori.reduce((acc, currentValue) => {
      return currentValue.harga < acc ? currentValue.harga : acc;
    }, kategori[0].harga);

    createNewProduct = await prisma.product.create({
      data: {
        namaProduk: namaProduk,
        deskripsiProduk: deskripsi || "Tidak ada deskripsi",
        hargaProduk: hargaMinimun,
        stokProduk: totalStok
      },
    });

    await prisma.productKategori.createMany({

      data: kategori.map(object => ({
        produkId: createNewProduct.id ,
        atribut: object.atribut,
        value: object.value,
        stok: object.stok,
        harga: object.harga,
      }))

    });
    
  } else {

    if (harga <= 0 || stok <= 0) {
      console.error(`Bad request harga or stok cannot be 0`);
      throw new ResponseEror(`Bad request harga or stok cannot be 0`, 400);
    };
    console.log(harga);
    console.log(stok);
    
    createNewProduct = await prisma.product.create({
      data: {
        namaProduk: namaProduk,
        deskripsiProduk: deskripsi || "Tidak ada deskripsi",
        hargaProduk: harga,
        stokProduk: stok,
      },
    });

  };

  console.log(`Succes`);

  return {
    product: createNewProduct,
    kategori: kategori || []
  };
};

export { addProduct };
