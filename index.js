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

app.get('/about-us', (req, res) => {
  res.render('about');
});

app.get('/menu', (req, res) => {
  res.render('menu');
});


app.get('/cart', (req, res) => {
  res.render('cart');
});

// blog
app.get('/blog', (req, res) => {
  let sql_text ="select * from T2005E_mlem_DanhMuc; " +
                " select * from T2005E_mlem_Blog; " +
                " select * from T2005E_mlem_MonAn;";
  let data = {
    danhmucs: [],
    articles: []
  };
  db.query(sql_text).then(rows =>{
      data.danhmucs = rows.recordsets[0],
      data.articels = rows.recordsets[1]
  }).catch(err => {
   })
  res.render('blog',data);
});
app.get('/blog/:id', async (req, res) => {
  let DanhMucID = req.params.id;
  let sql_text = `select * from T2005E_mlem_DanhMuc; `+
                `select * from T2005E_mlem_Blog where MonAnID `+
               ` IN (select ID from T2005E_mlem_MonAn where LoaiID `+
               ` IN (select ID from T2005E_mlem_DanhMuc WHERE ID LIKE '${DanhMucID}' ));`;
  let data = {
      danhmucs: [],
      articles: []
  };

  await db.query(sql_text).then(rows =>{
      data.danhmucs = rows.recordsets[0],
      data.articels = rows.recordsets[1]
  }).catch(err => {
  })
  res.render('blog',data);
})
app.get('/search', async (req,res) => {
  let keyword = req.query.search;
  let sql_text = `select * from T2005E_mlem_DanhMuc; `+
                 `select * from T2005E_mlem_View_Blog_MonAn_DanhMuc `+
                 ` WHERE T2005E_mlem_DanhMuc.Ten LIKE N'%${keyword}%' `+
                  ` OR T2005E_mlem_MonAn.TenSP LIKE N'%${keyword}%' `+
                  ` OR T2005E_mlem_Blog.TieuDe LIKE N'%${keyword}%'; `;
  let data = {
      danhmucs: [],
      articles: []
  };
  await db.query(sql_text).then(rows => {
      data.danhmucs = rows.recordsets[0],
      data.articels = rows.recordsets[1]
  }).catch(err => {
    console.log(err.message);
  });
  res.render('blog',data);
})


app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/reservation', (req, res) => {
  res.render('reservation');
});
app.get('/slide', (req, res) => {
  res.render('slide');
});
