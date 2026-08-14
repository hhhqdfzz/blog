---
title: TLS 证书
---

# {{ $frontmatter.title }}


TLS（传输层安全）证书是确保网络通信安全的**企业级**工具。它通过加密技术保护数据传输，防止窃听和篡改，同时验证服务器的身份，确保用户访问的是合法网站。
- 加密通信：使用公钥和私钥对数据进行加密，防止数据被窃取。
- 身份验证：通过证书颁发机构（CA）签发的证书，证明服务器的合法性，防止中间人攻击。

## 生成 TLS 证书
1. 安装 OpenSSL
    ```bash
    sudo apt install openssl -y
    ```
2. 使用 OpenSSL 生成 2048 位的 RSA 私钥 `server.key`
    ```bash
    openssl genrsa -out server.key 2048
    ``` 
3. 创建证书签名请求（CSR）
    用私钥 生成 CSR 文件 `server.csr`，用于向 CA 申请证书。
    ```bash
    openssl req -new -key server.key -out server.csr
    ```
    在生成过程中，需填写域名、组织信息等。

4. 使用自签名证书（可选）
    如果仅用于测试环境，可生成自签名证书。
    ```bash
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
    ```
    上述证书有效期为 365 天，需定期更新。
    





    
