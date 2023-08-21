const productService = require("../services/productServices");
const productModel = require("../models/productModel");
const CsvParser = require("json2csv").Parser;
const XLSX = require("xlsx");
const ExcelJs = require("exceljs");
const excelToJson = require("convert-excel-to-json");
const xlsxReader = require("xlsx");

const uploadFile = require("../middleware/upload");
const fs = require("fs");
const { isAuthenticated } = require("../middleware/auth");

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).send({
      status: "success",
      message: "get all products successfully",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.addProducts = async (req, res, next) => {
  try {
    const products = await productService.addProducts(req.body);
    return res.status(200).send({
      status: "success",
      message: "added product successfully",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).send({
      status: "success",
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProductById = async (req, res, next) => {
  try {
    const product = await productService.updateProductById(
      req.params.id,
      req.body
    );
    return res.status(200).send({
      status: "success",
      message: "updated product successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProductById = async (req, res, next) => {
  try {
    const product = await productService.deleteProductById(req.params.id);
    return res.status(200).send({
      status: "success",
      message: "deleted product successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProducts = async (req, res, next) => {
  try {
    const products = await productService.deleteProducts(req.body.userId);
    return res.status(200).send({
      status: "success",
      message: "deleted products successfully",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPublishedProducts = async (req, res, next) => {
  try {
    const products = await productService.getPublishedProducts({
      isDeleted: false,
      isPublished: true,
    });
    return res.status(200).send({
      status: "success",
      message: "fetched published products successfully",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductByName = async (req, res, next) => {
  try {
    const products = await productService.getProductByName(
      { name: req.query.name },
      { isDeleted: false }
    );
    return res.status(200).send({
      status: "success",
      message: "fetched products by name successfully",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductsCSV = async (req, res, next) => {
  try {

    var workbook = new ExcelJs.Workbook();

    workbook.name = "";
    workbook.description = "";
    workbook.isPublished = "";
    workbook.productImage = "";
    workbook.price = "";
    workbook.rating = "";
    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: "visible",
      },
    ];
    var worksheet = workbook.addWorksheet("My Sheet");
    worksheet.columns = [
      { header: "id", key: "id", width: 10 },
      { header: "name", key: "name", width: 32 },
      { header: "description", key: "description", width: 35 },
      { header: "isPublished", key: "isPublished", width: 10 },
      { header: "productImage", key: "productImage", width: 35 },
      { header: "price", key: "price", width: 10 },
      { header: "rating", key: "rating", width: 10 },
    ];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment : filename=productData.xlsx"
    );

    workbook.xlsx.write(res).then(() => {
      res.send();
      console.log("File write done........");
    });
  } catch (err) {
    next(err);
  }
};

exports.add = async (req, res, next) => {
  try {
    await uploadFile(req, res);
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    } else {
      isExcelSheetEmpty = true;

      const file = xlsxReader.readFileSync("public/" + req.file.filename);

      if (!file.SheetNames.includes("My Sheet")) {
        return res
          .status(400)
          .send({
            status: "failed",
            message: "please upload valid excel file!",
          });
      }

      const excelSheetData = xlsxReader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[0]],
        { blankrows: true }
      );
      for (let i = 0; i < excelSheetData.length; i += 1) {
        if (
          excelSheetData[i].name ||
          excelSheetData[i].productImage ||
          excelSheetData[i].description ||
          excelSheetData[i].price ||
          excelSheetData[i].isPublished ||
          excelSheetData[i].rating
        ) {
          isExcelSheetEmpty = false;
        }
      }

      if (isExcelSheetEmpty) {
        return res
          .status(400)
          .send({
            status: "failed",
            message: "please add the product data in excel sheet!",
          });
      }

      const addingProducts = [];
      excelSheetData.forEach((product, key) => {
        if (Object.keys(product).length > 0) {
          const productResponse = {
            ...product,
            name: product.name,
            description: product.description,
            price: product.price,
            productImage: product.productImage,
            rating: product.rating,
          };
          addingProducts.push(productResponse);
        }
      });

      const createProduct = addingProducts.map((product) => {
        return productService.addProducts({
          ...product,
          name: product.name,
          description: product.description,
          price: product.price,
          productImage: product.productImage,
          rating: product.rating,
          userId: req.userId,
        });
      });
      res
        .status(200)
        .send({
          status: true,
          msg: "Products added successfully",
          data: createProduct,
        });
    }
  } catch (err) {
    next(err);
  }
};
