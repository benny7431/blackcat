# Black cat Discord bot
![Lines of code](https://img.shields.io/tokei/lines/github/blackcatbot/blackcat)
![GitHub Last commit](https://img.shields.io/github/last-commit/blackcatbot/blackcat?color=%23181717&logo=GitHub)
![GitHub License](https://img.shields.io/github/license/blackcatbot/blackcat?color=%23F05032&logo=git)
![CodeFactor](https://img.shields.io/codefactor/grade/github/blackcatbot/blackcat/main?color=%23F44A6A&logo=codefactor)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/blackcatbot/blackcat?color=%234C4A73&label=Synk%20Vulnerabilities&logo=snyk)
![NodeJS](https://img.shields.io/badge/Node.js-%2343853D.svg?logo=node.js&logoColor=white)

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

### 使用按鈕部署

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### 使用終端機部署

- 新增一個新的應用程式
  - ```sh
    heroku create <Your own app name>
    ```
- 將Heroku git remote新增到git中
  - ```sh
    heroku git:remote -a <Your app name>
    ```
- 將部署方式設定成Ubuntu 20.04
  - ```sh
    heroku stack:set heroku:20
    ```
- 新增Node.js Buildpack
  - ```sh
    heroku buildpacks:set heroku/nodejs
    ```
- 部署程式
  - ```sh
    git push heroku main
    ```

**請確認所有環境變數已經設置完成!**

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

所需環境:
```yaml
Node: >=16.6.0
Yarn: >=1.22.10
```
> 使用Windows環境會在安裝時發生錯誤，請使用Linux環境

- 所需套件:
  - make
  - automake
  - autoconf
  - python3
  - g++
  - libtool
  - curl
  - tar
- 安裝套件
  - ```sh
    yarn install
    yarn run build
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
