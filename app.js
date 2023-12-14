//導入express 框架 以及 模塊
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const db = require('./db.js'); //資料庫
const bcrypt = require('bcrypt'); //加密模塊
const path = require('path');

// ==================================================

//express 實例化
const app = express();

// ==================================================

//啟用模塊
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: 'your-secret-key',  // 提供一個用於簽署會話ID的字串，可以是任何安全的字串
    resave: false,  // 這是一個過時的選項，通常設置為 false
    saveUninitialized: false,  // 這是一個過時的選項，通常設置為 false
}));

app.use(express.static(path.join(__dirname)));
// ==================================================
// token
// 在你的伺服器程式碼中
const secretKey = 'your-super-secret-key'; // 替換為一個安全的密鑰

// ...

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    

    if (!token) {
        return res.status(401).json({ success: false, message: '未提供 Token' });
    }

    const cleanedToken = token.replace('Bearer ', '');

    console.log(cleanedToken)

    // 驗證 Token
    jwt.verify(cleanedToken, secretKey, { ignoreExpiration: false }, (err, decoded) => {
        if (err) {
            console.error('Token 解碼錯誤:', err);
            return res.status(403).json({ success: false, message: 'Token 無效' });
        }
    
        // 將解碼的用戶信息添加到 req 中，方便後續處理
        req.user = decoded;
    
        // 繼續處理下一步
        next();
    });
}

// ==================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/'); // 存儲圖片的文件夾
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 生成唯一的文件名
    }
});

const upload = multer({ storage: storage });


// ==================================================
//首頁
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '1Login.html'));
});

// 定義GET請求的路由
//當客戶端發送 get 請求到這個路徑時，對應的回調函數會被執行。

//'/'客戶端連接伺服 
//req（代表客戶端請求）和 res（代表伺服器端回應）。

// req 包含有關客戶端發送的請求的信息，例如請求的頭部、參數等
// res 是用於發送回應給客戶端的對象。在這個例子中
// 使用 res.send('Hello World!') 發送一個簡單的字符串 "Hello World!" 作為回應。
//參數1：客戶端請求的URL 地址
//參數2：請求對應的處理函數
//    req：請求對象（包含了與請求相關的屬性與方法）
//	  res：響應對象（包含了與響應相關的屬性與方法）

app.get('/api/register',(req,res)=>{
    res.send('Hello');
});

app.get('/api/login',(req,res)=>{
    res.send('Hello');
});

app.get('/api/upload',(req,res)=>{
    res.send('Hello');
});


//用戶登錄
app.get('/api/login', (req, res) => {
    // 檢查用戶是否已登錄
    if (req.session.user) {
        // 用户已登录，可以访问普通用户页面
        res.sendFile(__dirname + '/public/3Album.html', {
            userId: req.session.user.userId,
            email: req.session.user.email,
            // 其他用户信息...
        });
    } else {
        // 用戶未登錄 轉回登錄頁面
        res.redirect('/1Login.html');
    }
});

//token
app.get('/secure-page', verifyToken, (req, res) => {
    // 如果 Token 驗證通過，則 req.user 包含解碼的用戶信息
    res.json({ success: true, message: '身分驗證通過', user: req.user });
});

//用戶圖片
// app.get('/api/user-images', verifyToken, async (req, res) => {
//     try {
//         const userId = req.user.email;
//         const albumTitle = req.query.album; // 假設相簿標題作為查詢參數發送

//         // 使用 getUserImagesByAlbum 函數來根據相簿標題獲取相片
//         const userImages = await db.getUserImagesByAlbum(userId, albumTitle);

//         res.json({ success: true, userImages });
//     } catch (error) {
//         console.error('獲取用戶相片時發生錯誤:', error);
//         res.status(500).json({ success: false, message: '無法檢索用戶相片' });
//     }
// });

//用戶相簿
app.get('/api/user-albums', async (req, res) => {
    const userEmail = req.headers['user-email'];
    console.log(userEmail)
    try {
        // 根據使用者 email 從 useralbum 表格中獲取相簿資訊
        const userAlbums = await db.getUserAlbums(userEmail);
        res.json({ success: true, userAlbums });
    } catch (error) {
        console.error('Error getting user albums:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

//相簿圖片
app.get('/api/user-images', verifyToken, async (req, res) => {
    try {
        const userId = req.user.email;
        console.log(req.headers['albumtitle'])
        // 檢查是否有相簿名稱的查詢參數
        const albumTitle = req.headers['albumtitle'];

        console.log('相簿名稱:', albumTitle,userId);

        // 根據情況選擇要查詢的資料庫操作
        let userImages;
        if (albumTitle) {
            userImages = await db.getUserImagesByAlbum(userId, albumTitle);
        } else {
            userImages = await db.getUserImages(userId);
        }

        res.json({ success: true, userImages });
    } catch (error) {
        console.error('Error getting user images:', error);
        res.status(500).json({ success: false, message: '獲取用戶圖片失敗' });
    }
});

// ==================================================

// 定義POST請求的路由
//當客戶端發送 post 請求到這個路徑時，對應的回調函數會被執行。
app.post('/api', (req, res) => {
    console.log(req.body);
    res.send('Received POST request');
});

// POST 路由，處理註冊請求
app.post('/api/register', (req, res) => {
    const { email, pwd } = req.body;

    // 在這裡你可以對收到的資料進行處理，例如將用戶資訊存入資料庫
    db.registerUser(email, pwd)
    .then(result => {
        console.log('用戶註冊成功:', result.rows[0]);
        // 假設成功註冊，回傳一個成功的 JSON 回應
        res.json({ success: true, message: '用戶註冊成功', email, pwd });
    })
    .catch(error => {
        console.error('Error registering user:', error);
        // 假設註冊失敗，回傳一個失敗的 JSON 回應
        res.json({ success: false, message: '註冊錯誤' });
    });
});

//客戶端登入
app.post('/api/login', async (req, res) => {
    const { email, pwd } = req.body;

    try {
        // 查詢使用者
        const user = await db.getUserByEmail(email);

        // 如果找不到使用者，表示登入失敗
        if (!user) {
            return res.json({ success: false, message: '使用者不存在' });
        }

        // 使用 Bcrypt 核對密碼
        const passwordMatch = await bcrypt.compare(pwd, user.password);

        if (passwordMatch) {
            // 密碼核對成功，可以視為登入成功
            
            //生成token
            const token = jwt.sign({ userId: user.userId, email: user.email }, 'your-super-secret-key');
            //設置用戶訊息
            req.session.user = {
                userId: user.userId,
                email: user.email,
                // 其他用户信息...
            };

            return res.json({ success: true, message: '登入成功', token: token });
        } else {
            // 密碼核對失敗，表示登入失敗
            return res.json({ success: false, message: '密碼不正確' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: '內部伺服器錯誤' });
    }
});
    
// 處理上傳的圖片
app.post('/api/upload', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const userId = req.user.email;
        const imagePath = req.file.path;
        const albumTitle = req.body.album_title; 

        console.log(albumTitle)

        await db.saveImagePath(userId, imagePath, albumTitle);

        res.json({ success: true, message: '圖片上傳成功' });
    } catch (error) {
        console.error('Error during image upload:', error);
        res.status(500).json({ success: false, message: '圖片上傳失敗' });
    }
});

//創建相簿
app.post('/api/create-album', async (req, res) => {
    const { email, title } = req.body;

    try {
        // 在 useralbum 表格中新增相簿資訊
        const result = await db.createAlbum(email, title);

        res.json({ success: true, message: '相簿建立成功' });
    } catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});
// ==================================================

// put 請求
//當客戶端發送 put 請求到這個路徑時，對應的回調函數會被執行。
app.put('/api',(req,res)=>{
    res.send('put Express') //發送請求
})

// ==================================================
// delete 請求
//當客戶端發送 DELETE 請求到這個路徑時，對應的回調函數會被執行。
app.delete('/api',(req,res)=>{
    res.send('Delete Express') //發送請求
})

//刪除圖片
app.delete('/api/delete', verifyToken, async (req, res) => {
    try {
        const userId = req.user.email;
        const imagePath = req.body.imagePath; // 從請求主體中獲取圖片路徑

        // 刪除資料庫中的圖片記錄
        await db.deleteUserImage(userId, imagePath);

        res.json({ success: true, message: '圖片刪除成功' });
    } catch (error) {
        console.error('Error during image deletion:', error);
        res.status(500).json({ success: false, message: '圖片刪除失敗' });
    }
});

// ==================================================

//連接伺服器
let post = 3000;
app.listen(post, ()=>{
    console.log('post:',{post},'http://localhost:3000/')
})