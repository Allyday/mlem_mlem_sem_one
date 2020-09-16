const express = require('express')
const app = express();
const PORT = process.env.PORT || 5000;

// tao may chu
app.listen(PORT, () => {
  console.log('Server is running at port', PORT);
});

// allow access & use of public resources
app.use(express.static('public'));
// allow ejs syntax: mix view & logic
app.set('view engine', 'ejs');

// config sql server
const mssql = require('mssql');
const config = {
  server: '101.99.13.2',
  user: 'sa',
  password: 'z@GH7ytQ',
  database: 'test',
};
mssql.connect(config, err => {
  if (err) console.log('Error:', err);
  else console.log('Successfully connected to database!');
});

const db = new mssql.Request();

// routings
app.get('/', (req, res) => {
  res.render('home');
  // let get_danh_mucs = 'SELECT * FROM DanhMuc;';
  // let get_brands = 'SELECT * FROM ThuongHieu;';
  // let get_products = 'SELECT * FROM SanPham;';
  // db.query(get_danh_mucs + get_brands + get_products, (err, data) => {
  //   if (err) res.send(err);
  //   else res.render('home', {
  //     tabs: data.recordsets[0],
  //     brands: data.recordsets[1],
  //     products: data.recordsets[2],
  //   });
  // });
});
