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
//use body-parser
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));

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
});

app.get('/about-us', (req, res) => {
  res.render('about');
});

// blog
app.get('/blog', async (req, res) => {
  let sql_text = "select top 4 * from T2005E_mlem_DanhMuc; " +
    " select top 4 * from T2005E_mlem_Blog; ";
  let data = {
    DanhMucs: [],
    articles: []
  };
  await db.query(sql_text).then(rows => {
    data.DanhMucs = rows.recordsets[0];
    data.articles = rows.recordsets[1];
  }).catch(err => {
    console.log(err.message);
  })
  res.render('blog', data);
});
app.get('/blog/:id', async (req, res) => {
  let MonAnID = req.params.id;
  let sql_text = `select top 4 * from T2005E_mlem_DanhMuc; ` +
    `select * from T2005E_mlem_Blog  where MonAnID in (select ID from T2005E_mlem_MonAn where LoaiID like ${MonAnID} );`;
  let data = {
    DanhMucs: [],
    articles: []
  };
  await db.query(sql_text).then(rows => {
    data.DanhMucs = rows.recordsets[0],
      data.articles = rows.recordsets[1]
  }).catch(err => {
  });
  if (data.articles == 'NULL' || data.articles == '') {
    res.render('blog-article-null', data);
  } else if (data.articles != 'NULL' || data.articles != '') {
    res.render('blog-id', data);
  }

})
app.get('/search', async (req, res) => {
  let keyword = req.query.search;
  let sql_text = `select top 4 * from T2005E_mlem_DanhMuc; ` +
    `SELECT T2005E_mlem_Blog.* FROM T2005E_mlem_Blog ` +
    ` INNER JOIN T2005E_mlem_MonAn ON T2005E_mlem_Blog.MonAnID = T2005E_mlem_MonAn.ID ` +
    ` WHERE T2005E_mlem_MonAn.TenSP LIKE N'%${keyword}%' ` +
    ` OR T2005E_mlem_Blog.TieuDe LIKE N'%${keyword}%'; `;
  let data = {
    DanhMucs: [],
    articles: []
  };
  await db.query(sql_text).then(rows => {
    data.DanhMucs = rows.recordsets[0],
      data.articels = rows.recordsets[1]
  }).catch(err => {
    // console.log(err.message);
  });
  if (data.articles == 'NULL' || data.articles == '') {
    res.render('blog-article-null', data);
  } else if (data.articles != 'NULL' || data.articles != '') {
    res.render('blog', data);
  }
})

//reservation
app.get('/reservation', (req, res) => {
  let sql_text = `select top 3 * from T2005E_mlem_DanhMuc ORDER BY ID ASC; `;
  db.query(sql_text, (err, rows) => {
    if (err) res.send(err);
    else {
      res.render('reservation', {
        danhmucs: rows.recordset
      });
    }
  });
});
app.get('/contact', (req, res) => {
  let sql_text = `select top 1 * from T2005E_mlem_ViTri;`;
  db.query(sql_text, (err, rows) => {
    if (err) res.send(err);
    else res.render('contact', {
      vitris: rows.recordsets[0]
    });
  });
});
app.get('/location', (req, res) => {
  let city = req.query.city;
  let sql_text = `SELECT * FROM T2005E_mlem_ViTri WHERE ThanhPho LIKE '%${city}%'`;
  db.query(sql_text, (err, rows) => {
    if (err) res.send(err);
    else res.render('contact', {
      vitris: rows.recordsets[0]
    });
  });
});

app.get('/cart', (req, res) => {
  res.render('cart');
});


//menu order
app.get('/menu', (req, res) => {

  let sql_text = 'select * from T2005E_mlem_DanhMuc;' +
    `select * from T2005E_mlem_MonAn;`;
  db.query(sql_text, (err, rows) => {
    if (err) res.send(err);
    else {
      res.render('menu', {
        danhmucs: rows.recordsets[0],
        menus: rows.recordsets[1]
      })
    }
  })
})




