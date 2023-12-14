// 讀取條
function goToPageLoader(pageUrl) {
    showLoading();
    setTimeout(() => {
            window.location.href = pageUrl;
    }, 700); 
};
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
};

function closeLoading(){
    document.getElementById('loadingOverlay').style.display = 'none';
}

function loadPage(){
    showLoading();
    setTimeout(() => {
        closeLoading();
    }, 700); 
}

function loadserverdelay(){
    showLoading();
    setTimeout(() => {
        closeLoading();
    }, 1700); 
}

// =======================================
//註冊提示文字控制
function retext(text) {
    const retextElement = document.getElementById('Register');
    retextElement.style.display = 'block';
    retextElement.innerText = text;
}


// 信箱判斷
function isValidEmail(email1) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email1);
  }

//用戶註冊資料
function registerUser(event) {
    event.preventDefault(); // 阻止表單的默認提交行為

    const r_form = document.getElementById('registerForm');
    // 獲取表單元素和輸入的值
    const email = document.getElementById('r_email').value;
    const pwd = document.getElementById('r_pwd').value;
    
    console.log(email,pwd);

    if(isValidEmail(email)&& pwd.length >= 8){
        fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, pwd: pwd }),
        })
        .then(response => response.json())
        .then(data => {
            // 處理伺服器回應
            console.log(data);
            // 這裡可以添加顯示成功或失敗的邏輯
            if(data.success){
                retext('註冊成功！！');
            }
        })
        .catch(error => {
            retext('註冊失敗，伺服器錯誤！！');
            console.error('Error:', error);
        }); 
    }else{
        if(pwd.length < 8){
            retext('密碼數量需大於8！！')
        }else{
            retext('請確認是否為正確的信箱地址！！');
        }
    }
}
// =======================================
// =======================================
// =======================================
const ok_login = document.getElementById('ok_login');
const no_login = document.getElementById('no_login');

let useremail = document.getElementById('useremail');

function loginpage1(){
    ok_login.style.display = 'block';
    no_login.style.display = 'none';
}
//登入讀取
const login_button = document.getElementById('login_b');
login_button.addEventListener('click',()=>{
    loadserverdelay();
})
//登入
function Logintest(event){
    event.preventDefault(); // 阻止表單的默認提交行為
    
    const loginform = document.getElementById('loginForm');
    const email = document.getElementById('l_email').value;
    const pwd = document.getElementById('l_pwd').value;
    fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, pwd: pwd }),
    })
    .then(response => response.json())
    .then(data => {
        // 處理伺服器回應
        console.log(data);
        // 這裡可以添加顯示成功或失敗的邏輯
        if(data.success){

            

            loadPage();
            loginpage1();
            useremail.innerText = email;
            localStorage.setItem('token', data.token);
            
            opencreat_a.style.display = 'none'

            getUserAlbums();

        }else{
            
            if(pwd.length < 8){
                retext('密碼數量需大於8！！')
            }else{
                retext('請確認是否為正確的信箱地址！！');
            }
            retext('登入失敗，密碼不正確！！');
        }
    })
    .catch(error => {
        retext('登入失敗，伺服器錯誤！！');
        console.error('Error:', error);
    }); 

    console.log(email,pwd);
    
}
// =======================================

//登出
const logout_b = document.getElementById('logout_b');
logout_b.addEventListener('click',()=>{
    loadPage();
})


// =======================================
// 返回
function Logout(event){
    event.preventDefault(); // 阻止表單的默認提交行為

    // 刪除存儲在 Cookie 中的 Token
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // 或者刪除存儲在 Local Storage 中的 Token
    // localStorage.removeItem('token');

    // 跳轉到登入頁面
    ok_login.style.display = 'none';
    no_login.style.display = 'block';
}

// =======================================
// =======================================
let currentAlbumTitle;
// 上傳圖片
function uploadimg(event) {
    event.preventDefault();

    const albumTitle = currentAlbumTitle;

    console.log(albumTitle)

    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    const yourAuthToken = localStorage.getItem('token');
    const tokenWithoutBearer = yourAuthToken.replace('Bearer ', '');

    console.log(tokenWithoutBearer);
    
    if (!file) {
        alert('請選擇一張圖片');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('album_title', encodeURIComponent(albumTitle)); // 替換 'YourAlbumTitle' 為實際的相簿標題
    
    fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + tokenWithoutBearer,
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadPage();
            updateUserImagesByAlbum(albumTitle)
        } else {
            alert('圖片上傳失敗');
        }
    })
    .catch(error => console.error('Error uploading image:', error));
}

// 顯示用戶上傳的圖片
let modalContent;
let imageItems;
let currentImageIndex = 0;

//==

document.addEventListener('DOMContentLoaded', function () {
    modalContent = document.querySelector('.modal-content');
    imageItems = document.querySelectorAll('.image-item');

    const modal = document.querySelector('.image-modal');
    const closeBtn = document.querySelector('.close-btn');
    const download = document.querySelector('.download');
    const deleteimg = document.querySelector('.deleteimg');
    let currentImageIndex = 0;
  
    // 設置點擊事件監聽器
    imageItems.forEach((item, index) => {
        item.addEventListener('click', (event) => {
            const imgSrc = item.querySelector('img').getAttribute('src');
            modalContent.setAttribute('src', imgSrc);
            modal.style.display = 'flex';
            // currentImageIndex = index;
            // handleImageClick(index); // 傳遞索引值
        });
    });
  
    // 設置關閉按鈕點擊事件監聽器
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    
    
    // 下載事件
    download.addEventListener('click', async () => {
        alert('123')
        
    });
    

    //刪除事件
    deleteimg.addEventListener('click', async () => {
            const modalContentElement = document.querySelector('.modal-content');
            const srcValue = modalContentElement.getAttribute('src');
            const modal = document.querySelector('.image-modal');
            modal.style.display = 'none';
        try {
    
            // 發送刪除請求到後端
            const response = await fetch('http://localhost:3000/api/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
                body: JSON.stringify({ imagePath: srcValue }), // 將圖片路徑放在請求主體中
            });
    
            const data = await response.json();
    
            if (data.success) {
                loadPage();
                // 在這裡你可能需要更新圖片列表或者做其他操作
                updateUserImagesByAlbum(currentAlbumTitle)
            } else {
                alert('圖片刪除失敗');
            }
        } catch (error) {
            console.log(srcValue)
            console.error('Error during image deletion:', error);
        }
    });
    
});

//==
//取得用戶圖片

// =======================================
//相簿
const open_create = document.getElementById('open_create')
let createopen = false;
let opencreat_a = document.getElementById('albuminput_con')
//開啟建立相簿行
open_create.addEventListener('click',()=>{
    const albuminput_con = document.getElementById('albuminput_con')
    

    if(createopen){
       createopen = false;
       albuminput_con.style.display = 'none' 
    }else{
        albuminput_con.style.display = 'flex'
        createopen = true
    }
})

//建立相簿
function createalbum(event){
    event.preventDefault();

    const albumname = document.getElementById('albumname').value;
    console.log(albumname)

    // 檢查相簿名稱是否有效
    if(albumname.trim() !== '') {
        // 獲取使用者的 email
        const userEmail = useremail.innerText;

        // 發送建立相簿的請求到後端
        fetch('http://localhost:3000/api/create-album', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token'),
            },
            body: JSON.stringify({ email: userEmail, title: encodeURIComponent(albumname) }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('相簿建立成功');
                // 在這裡你可能需要更新相簿列表或者做其他操作
                getUserAlbums();
            } else {
                alert('相簿建立失敗');
            }
        })
        .catch(error => console.error('Error creating album:', error));
    } else {
        alert('請輸入有效的相簿名稱');
    }
}

//獲取相簿
function getUserAlbums() {
    const userEmail = useremail.innerText;

    // 發送獲取使用者相簿的請求到後端
    fetch('http://localhost:3000/api/user-albums', {
        method: 'GET',
        headers: {
            'Authorization': localStorage.getItem('token'),
            'User-Email': userEmail, // 將使用者的 email 放在 headers 中
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 在這裡更新相簿列表的顯示，例如將相簿名稱加到相簿列表中
            const albumCon = document.querySelector('.album_con');
            albumCon.innerHTML = ''; // 清空原有的相簿列表

            data.userAlbums.forEach(album => {
                const albumForm = document.createElement('form');
                const albumkai = decodeURIComponent(album.title)
                albumForm.classList.add('album_open2');
                albumForm.innerHTML = `<input id="album_o" class="album_open" type="submit" value="${albumkai}" onclick="openalbum(event)">`;
                albumCon.appendChild(albumForm);
                
            });
        } else {
            alert('獲取用戶相簿失敗');
        }
    })
    .catch(error => console.error('Error getting user albums:', error));
}
//=================
//相片頁面開
function albumphotoopen(){
    const albumphotoopen = document.getElementById("album");
    const album_menuclose = document.getElementById("album_menu");
    album_menuclose.style.display = 'none';
    albumphotoopen.style.display = 'block';
}

//相片頁面關
function albumphotoclose(event){
    event.preventDefault();
    const album_menuopen = document.getElementById("album_menu");
    album_menuopen.style.display = 'block';
    const albumphotoopen = document.getElementById("album");

    albumphotoopen.style.display = 'none';
}
//相簿頁面關
//======================

//開啟相簿
function openalbum(event) {
    event.preventDefault();
    loadPage();
    // 獲取點擊的表單元素
    const clickedForm = event.target.closest('.album_open2');

    if (clickedForm) {
        // 獲取該表單元素中 .album_open 元素的值
        const submitValue = clickedForm.querySelector('.album_open').value;
        const albumtext = document.getElementById('album_text') 
        console.log(submitValue);

        albumtext.innerText = submitValue;
        currentAlbumTitle = submitValue;
        
        albumphotoopen()
        updateUserImagesByAlbum(submitValue)
    }
}





//========================
//相簿圖片
// 更新用戶圖片，以相簿標題為篩選條件
function updateUserImagesByAlbum(albumTitle) {
    const modal = document.querySelector('.image-modal');
    albumTitle = currentAlbumTitle;

    console.log(albumTitle)

    fetch('http://localhost:3000/api/user-images', {
        method: 'GET',
        headers: {
            'Authorization': localStorage.getItem('token',),
            'albumtitle': encodeURIComponent(albumTitle), // 新增相簿標題的標頭
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const imageGrid = document.getElementById('userImageGrid');
            imageGrid.innerHTML = ''; // 清空原有的圖片

            data.userImages.forEach(image => {
                const imageItem = document.createElement('div');
                imageItem.classList.add('image-item');

                const img = document.createElement('img');
                img.src = image.img_path;
                img.alt = 'User Image';

                imageItem.appendChild(img);
                imageGrid.appendChild(imageItem);

                // 為新的圖片項目添加點擊事件
                imageItem.addEventListener('click', () => {
                    const imgSrc = img.getAttribute('src');
                    modalContent.setAttribute('src', imgSrc);
                    modal.style.display = 'flex';
                });
            });
        } else {
            alert('獲取用戶圖片失敗');
        }
    })
    .catch(error => console.error('Error getting user images:', error));
}





