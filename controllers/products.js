const Products = require('../models/product');

const getAllProductsStatic = async (req, res) => {
  //Sorting name as alphabethic order --> name
  //Sorting name as reverse alphabethic order --> -name
  // const sortedProducts = await Products.find({}).sort('-name price');
  // res.status(200).json({ sortedProducts, nbHits: products.length });

  //Select option
  const selectedProducts = await Products.find({}).select('name price');
  console.log(selectedProducts);
  // { _id: 619a5c2f3cf3763a406a63bb, name: 'Galaxy Watch4', price: 64 }
  // res.status(200).json({ selectedProducts, nbHits: selectedProducts.length });

  //Limited Products
  // const LimitedProducts = await Products.find({})
  //   //alfabetik olarak name'e göre sıralar.
  //   .sort('name')
  //   // name ve price key'leri seçilir
  //   .select('name price')
  //   // 5 tane gösterilecek.
  //   .limit(5);
  // res.status(200).json({ LimitedProducts, nbHits: LimitedProducts.length });

  //Numberic Filters
  // $gt --> greater than
  const filteredProducts = await Products.find({ price: { $gt: 1000 } })
    .sort('price')
    .select('name price');
  res.status(200).json({ filteredProducts, nbHits: filteredProducts.length });
};

const getAllProducts = async (req, res) => {
  try {
    const { featured, company, name, sort, fields, numbericFilters } =
      req.query;
    console.log(sort);
    const queryObject = {};
    if (featured) {
      queryObject.featured = featured === 'true' ? true : false;
    }
    if (company) {
      queryObject.company = company;
    }
    if (name) {
      queryObject.name = { $regex: name, $options: 'i' };
    }
    if (numbericFilters) {
      const operatorMap = {
        '>': '$gt',
        '<': '$lt',
        '=': '$eq',
        '>=': '$gte',
        '<=': '$lte',
      };
      const regEx = /\b(<|>|>=|<=|=)\b/g;
      let filters = numbericFilters.replace(
        regEx,
        match => `-${operatorMap[match]}-`
      );
      const options = ['price', 'rating'];
      filters = filters.split(',').forEach(item => {
        const [field, operator, value] = item.split('-');
        console.log(field, operator, value);
        console.log(item.split('-'));
        if (options.includes(field)) {
          queryObject[field] = { [operator]: Number(value) };
        }
      });
    }

    console.log(queryObject);
    // console.log(queryObject);
    let result = Products.find(queryObject);
    //sort
    if (sort) {
      const sortList = sort.replace(',', ' ');
      result = result.sort(sortList);
    }
    //Default sorting with created date
    else {
      result = result.sort('createAt');
    }
    if (fields) {
      const fieldsList = fields.split(',').join(' ');
      result = result.select(fieldsList);
    }

    //Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);
    //23
    // 4 7 7 7 2

    const products = await result;
    res.status(200).json({ products, nbHits: products.length });
  } catch (error) {
    throw new Error('Something went wrong!');
  }
};

module.exports = { getAllProductsStatic, getAllProducts };
