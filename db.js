//資料庫 封裝

//導入資料庫模塊
const { Pool } = require('pg');

const bcrypt = require('bcrypt'); //加密模塊

//配置 PostgreSQL 連接參數
const pool = new Pool({
    user: 'ygsoto',
    host: 'localhost',
    database: 'postgres',
    password: '123456',
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    registerUser: async (email, pwd) => {
        const emailCheck = await pool.query('SELECT * FROM userinfo WHERE email = $1', [email]);

        if (emailCheck.rows.length > 0) {
            // 如果存在，表示該信箱已經註冊過，返回相應的錯誤訊息
            throw { success: false, message: '該信箱已經註冊過' };
        }

        //密碼加密
        const hashedPassword = await bcrypt.hash(pwd, 10); // 10 是 saltRounds，可以根據需求調整
        //註冊流程
        const text = 'INSERT INTO userinfo(email, password) VALUES($1, $2) RETURNING *';
        const values = [email, hashedPassword];
    
        return pool.query(text, values);
    },

    getUserByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM userinfo WHERE email = $1', [email]);
        return result.rows[0]; // 假設使用者的 email 是唯一的
    },

    //圖片處理

    // saveImagePath: async (userId, imagePath) => {
    //     const text = 'INSERT INTO userphoto(email, img_path) VALUES($1, $2) RETURNING *';
    //     const values = [userId, imagePath];
    
    //     return pool.query(text, values);
    // },

    //更改
    saveImagePath: async (userId, imagePath, albumTitle) => {
        const text = 'INSERT INTO userphoto(email, img_path, album_title) VALUES($1, $2, $3) RETURNING *';
        const values = [userId, imagePath, albumTitle];
        return pool.query(text, values);
    },

    getUserImages: async (userId) => {
        const result = await pool.query('SELECT * FROM userphoto WHERE email = $1', [userId]);
        return result.rows;
    },
    // 刪除圖片
    deleteUserImage: async (userId, imagePath) => {
        const text = 'DELETE FROM userphoto WHERE email = $1 AND img_path = $2';
        const values = [userId, imagePath];
    
        return pool.query(text, values);
    },
    getallImages: async () => {
        const result = await pool.query('SELECT img_path FROM userphoto');
        return result.rows.map(row => row.img_path);
    },
    

    //相簿

    getUserAlbums: async function (email) {
        try {
            const result = await pool.query('SELECT * FROM useralbum WHERE email = $1', [email]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },
    
    createAlbum: async function (email, title) {
        try {
            const result = await pool.query('INSERT INTO useralbum (email, title) VALUES ($1, $2) RETURNING *', [email, title]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    //相簿圖片
    getUserImagesByAlbum: async (userId, albumTitle) => {
        let query;
        let values;
    
        // 如果提供了相簿名稱，則按相簿名稱篩選；否則，獲取所有圖片
        if (albumTitle) {
            query = 'SELECT * FROM userphoto WHERE email = $1 AND album_title = $2';
            values = [userId, albumTitle];
        } else {
            query = 'SELECT * FROM userphoto WHERE email = $1';
            values = [userId];
        }
    
        const result = await pool.query(query, values);
        return result.rows;
    },
};

