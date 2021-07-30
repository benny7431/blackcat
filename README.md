# Black cat Discord bot
![NodeJS](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Heroku](https://img.shields.io/badge/heroku-%23430098.svg?style=for-the-badge&logo=heroku&logoColor=white)

**注意：此程式碼是為Black cat寫的，自行運行程式碼可能會發生錯誤**

**初學者不建議使用此程式碼**

***

# ⚒️ 設定

環境變數:
| 名稱 | 註解 |
| :---: | :---: |
| `TOKEN` | Discord 機器人 Token |
| `PREFIX` | Discord 機器人前綴 |
| `MONGO_DB_URL` | Mongo DB 連線URI |
| `WEBHOOK_ID` | Discord Webhook ID，用於紀錄 |
| `WEBHOOK_SECRET` | Discord webhook secret，用於紀錄 |
| `CLIENT_SECRET` | Discord bot client secret，用於Oauth2驗證 |
| `PM2_SECRET` | Pm2.io 連線 secret |
| `PM2_PUBLIC` | Pm2.io 連線 public |
| `ENCODE_KEY` | Oauth2 Token解碼/加密金鑰，**長度必須為24個字元!** |
| `HEROKU_API_KEY` | Heroku API金鑰，用於重新啟動機器人 |
| `HEROKU_APP_ID` | Heroku App名稱或ID，用於重新啟動機器人 |

# 🏗️ 啟動機器人

## 部署至Heroku
> 建議使用此方法

### 使用按鈕部署

<a href="https://heroku.com/deploy" target="_blank">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

### 使用終端機部署

- 新增一個新的應用程式
  - ```sh
    heroku create <Your own app name>
    ```
- 將Heroku git remote新增到git中
  - ```sh
    heroku git:remote -a <Your app name>
    ```
- 將部署方式設定成容器(Docker container)
  - ```sh
    heroku stack:set container
    ```
- 部署程式
  - ```sh
    git push heroku main
    ```

**請確認所有環境變數已經設置完成!**

## Heroku dynos
- Web dyno
  - 用於一般用途
- Worker dyno
  - 用於API被攻擊時，或者不希望開啟API功能

***

## 自行託管

### 使用Docker
> 自行託管時建議使用

- 將 `example.env` 裡的變數填寫完畢並重新命名該檔案成 `.env`
- 建立一個新的Docker image
  - ```sh
    docker build -t blackcat:latest .
    ```
    > 此程序可能會執行較久，請等待
- 啟動Container
  - ```sh
    docker run -d -p 8080:8080 \
      --name blackcatbot blackcat:latest
    ```

***

### 使用Node.js
> 使用Windows環境可能會在安裝時發生錯誤，建議使用Ubuntu

- 安裝所需套件
  - ```sh
    npm install
    ```
- 將 `example.env` 裡的變數填寫完畢並重新命名該檔案成 `.env`
- 啟動機器人
  - ```sh
    node index.js
    ```

# 👨‍💻 貢獻

1. 建立一個分支
2. 變更檔案
3. 開啟拉取請求

# 💳 作者及版權

建立基礎: [evobot](https://github.com/eritislami/evobot/)

由Wolf yuan翻譯及更改
