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
app.use(bodyparser.urlencoded({extended:true}));

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

// blog
app.get('/blog',async (req, res) => {
  let sql_text ="select * from T2005E_mlem_MonAn; " +
      " select top 4 * from T2005E_mlem_Blog; ";
  let data = {
    MonAncs: [],
    articles: []
  };
  await db.query(sql_text).then(rows =>{
    data.MonAncs = rows.recordsets[0] ;
    data.articels = rows.recordsets[1] ;
  }).catch(err => {
    console.log(err.message);
  })
  res.render('blog',data);
});
app.get('/blog/:id', async (req, res) => {
  let MonAnID = req.params.id;
  let sql_text = `select * from T2005E_mlem_MonAn; `+
      `select * from T2005E_mlem_Blog where MonAnID LIKE '${MonAnID}' ;`;
  let data = {
    MonAncs: [],
    articles: []
  };

  await db.query(sql_text).then(rows =>{
    data.MonAncs = rows.recordsets[0],
    data.articels = rows.recordsets[1]
  }).catch(err => {
  })
  res.render('blog-id',data);
})
app.get('/search', async (req,res) => {
  let keyword = req.query.search;
  let sql_text = `select * from T2005E_mlem_MonAn; `+
      `SELECT T2005E_mlem_Blog.* FROM T2005E_mlem_Blog `+
      ` INNER JOIN T2005E_mlem_MonAn ON T2005E_mlem_Blog.MonAnID = T2005E_mlem_MonAn.ID `+
      ` WHERE T2005E_mlem_MonAn.TenSP LIKE N'%${keyword}%' `+
      ` OR T2005E_mlem_Blog.TieuDe LIKE N'%${keyword}%'; `;
  let data = {
        MonAncs: [],
        articles: []
  };
  await db.query(sql_text).then(rows => {
        data.MonAncs = rows.recordsets[0],
        data.articels = rows.recordsets[1]
  }).catch(err => {
    // console.log(err.message);
  });
  res.render('blog',data);
})

//reservation
app.get('/reservation', (req, res) => {
    let sql_text = `select top 3 * from T2005E_mlem_DanhMuc ORDER BY ID ASC; `+
                    ` SELECT * FROM T2005E_mlem_Bookings;`
    db.query(sql_text, (err,rows) => {
        if (err) res.send(err);
        else if (rows.recordsets[1] == 'NULL' || rows.recordsets[1] == '') {
            res.render('reservation', {
                danhmucs: rows.recordsets[0]
            });
        }
        else res.render('reservation-NotNull', {
          danhmucs: rows.recordsets[0]
        });
    });
});
app.post('/booking',async (req,res) => {
    let name = req.body.name ;
    let phone = req.body.phone ;
    let people = req.body.people ;
    let date = req.body.date ;
    let email = req.body.email ;
    let time = req.body.time ;

    let sql_text = `INSERT INTO T2005E_mlem_Bookings(TenKH,Tel,SoNguoi,Ngay,Email,Gio) `+
                    `VALUES (N'${name}','${phone}',${people} ,'${date}', '${email}', '${time}');`;
    try {
     await db.query(sql_text);
    }catch (err) {
    }
    res.redirect(`/reservation`);
});
//contact
app.post('/save-comment',async (req,res) => {
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let message = req.body.message;
    let sql_text = `INSERT INTO T2005E_mlem_DanhGia (FullName,Phone,Email,Comment) `+
                    `values (N'${name}', ${phone} ,'${email}','${message}');`;
    try {
     await db.query(sql_text);
    }catch (err) {
    }
    res.redirect('/contact');
});
app.get('/contact', (req, res) => {
    let sql_text = `select top 1 * from T2005E_mlem_ViTri;`;
    db.query(sql_text, (err,rows) => {
      if (err) res.send(err);
      else res.render('contact',{
        vitris: rows.recordsets[0]
      });
    });
});
app.get('/thanh-pho', (req,res) => {
    let city = req.query.city;
    let sql_text = `SELECT * FROM T2005E_mlem_ViTri WHERE ThanhPho LIKE '%${city}%'`;
    db.query(sql_text, (err,rows) => {
      if (err) res.send(err);
      else res.render('contact', {
        vitris: rows.recordsets[0]
      });
    });
});

//cart
app.get('/cart', (req, res) => {
    let sql_text = `SELECT * FROM T2005E_mlem_Bookings; `+
                    `SELECT * FROM T2005E_mlem_MonAn where SOLUONG > 0`;
    db.query(sql_text, (err,rows) => {
        if (err) res.send(err);
        else  if ((rows.recordsets[0] == 'NULL' || rows.recordsets[0] == '') && (rows.recordsets[1] == 'NULL' || rows.recordsets[1] == '') ) {
            res.render('cart-Null-Both');
        }
        else if (rows.recordsets[0] == 'NULL' || rows.recordsets[0] == '') {
            res.render('cart-Null-Table', {
                dataBag: rows.recordsets[1]
            });
        }
        else if (rows.recordsets[1] == 'NULL' || rows.recordsets[1] == '') {
            res.render('cart-Null-Bag', {
                dataTable: rows.recordsets[0]
            });
        }
        else res.render('cart', {
                dataTable: rows.recordsets[0],
                dataBag: rows.recordsets[1]
            })
    });
});
app.post('/updata-table',async (req,res) => {
    let SoNguoi = req.body.soNguoi;
    let Ngay = req.body.date;
    let Time = req.body.time;
    let TenKH = req.body.TenKH;
    let sql_text = `UPDATE T2005E_mlem_Bookings SET SoNguoi= '${SoNguoi}', Ngay= '${Ngay}', Gio= '${Time}' WHERE TenKH LIKE N'%${TenKH}%';`;
    try {
        await db.query(sql_text);
    }catch (e) {
    }
    res.redirect('/cart');
});
app.post('/delete-table',async (req,res) => {
    let TenKH = req.body.TenKH;
    let sql_text = `delete from T2005E_mlem_Bookings WHERE TenKH LIKE N'%${TenKH}%'; DBCC CHECKIDENT ('T2005E_mlem_Bookings', RESEED, 0);`;
    try {
        await db.query(sql_text);
    }catch (e) {
    }
    res.redirect('/cart');
});

app.post('/update-order',async (req,res) => {
    let SoLuong = req.body.soLuong;
    let idOrder = req.body.IDmonan;
    let sql_text = `update T2005E_mlem_MonAn set  SOLUONG = ${SoLuong} where ID = ${idOrder} ;`;
    try {
        await db.query(sql_text);
    }catch (e) {
        console.log(e);
    }
    res.redirect('/cart');
});

app.post('/delete-order',async (req,res) => {
    let idOrder = req.body.IDmonan;
    let sql_text = `UPDATE T2005E_mlem_MonAn SET SOLUONG = 0 where ID LIKE ${idOrder} ;`;
    try {
        await db.query(sql_text);
    }catch (e) {
        console.log(e);
    }
    res.redirect('/cart');
});

//menu order
app.post('/order',async (req,res) => {
    let order = (req.body.soLuong) + 1;
    let idOrder = req.body.IDOrder;
    let sql_text = `UPDATE T2005E_mlem_MonAn SET SOLUONG = ${order} where ID LIKE ${idOrder} ;`;
    try {
        await db.query(sql_text);
    }catch (e) {
        console.log(e);
    }
    res.redirect('/menu');
})




