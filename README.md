# Usage

`npm install` dependencies. Initialize MySQL DB according to model in `/db/model.js`. Start with env variables below.


# Required env variables
- `PORT` Http server PORT
- `DBHOST` mysql db host
- `DBPORT` mysql db port
- `DBNAME` mysql db name
- `DBUSR` mysql db user
- `DBPW` mysql db pw
- `DBSSLKEY` mysql db ssl key
- `DBSSLCERT`mysql db ssl certificate
- `DBSSLCA` mysql db ssl ca certificate
- `JWTSECRET` jwt secret
- `JWTFILES` jwt secret for file access
- `MAILGUNKEY` mailgun.com api key
- `INTERNAL_AUTH_KEY` authentication key for communating with other servers
- `UPLOAD_URL` path to upload server (needed to notify for reencryption of files)

# Users

### HTTP Routes

- signup: `POST /` with username, email, password, returns logininfo
- signin: `POST /signin` with password, username (username or email), returns logininfo
- change password or email: `PUT /` with AUTHORIZATION Token, returns private info
- reset Password: `POST /resetpw` with AUTHORIZATION Token
- delete User: `DELETE /` with AUTHORIZATION Token
- info: `GET /[:id]`,  with AUTHORIZATION Token, private info with users token else public info
- decode Token: `POST /decode` with AUTHORIZATION Token as body.token, returns private info
- get random available username: `GET /freename`
- search users: `GET /search?q=QUERY`  with AUTHORIZATION Token & search term as QUERY

### User Model

    {
      "id": public INT,
      "name": public STRING,
      "password": invisible BCRYPT STRING,
      "email": private STRING
    }

### logininfo
    {
      "user": private user,
      "token": JWT
    }

# Userdata

### HTTP Routes

- set data: `POST /` with AUTHORIZATION token and encrypted data
- get data: `GET /` with AUTHORIZATION token

### Data Model

    {
      "data": "encrypteddata"
    }


# Data

### HTTP Routes

- create Store: `POST /stores` with AUTHORIZATION Token & Store name,password, access=0|1|2 (invitations, password, link)
- search Stores: `GET /stores?q=QUERY` with AUTHORIZATION token & QUERY
- modify Store: `PUT /stores/:storeid` with AUTHORIZATION Token & \[password, link=true|false\] (only owner)
- delete Store: `DELETE /stores/:storeid` with AUTHORIZATION Token & Store password (only owner)
- get Info and Folders: `GET /stores/:storeid` with AUTHORIZATION Token & Store password
- add Folder: `POST /stores/:storeid/folders` with AUTHORIZATION Token & Store password, folder shortname, parentId
- delete Folder: `DELETE /folders/:folderid` with AUTHORIZATION Token & Store password (only owner)
- delete File: `DELETE /file/:fileid` with AUTHORIZATION Token & Store password (only owner)
- get Tests: `GET /folders/:folderid/tests` with AUTHORIZATION Token & Store password
- create Test: `POST /folders/:folderid/tests` with AUTHORIZATION Token & Store password
- get Test: `GET /tests/:testid` with AUTHORIZATION Token & Store password
- delete Test: `DELETE /tests/:testid` with AUTHORIZATION Token & Store password (only testowner & owner)
- add Test question: `POST /tests/:testid` with AUTHORIZATION Token & Store password
- delete Test question: `DELETE /testquestions/:questionid` with AUTHORIZATION Token & Store password (only testowner, owner & collaborators)
- change Test question: `PUT /testquestions/:questionid` with AUTHORIZATION Token & Store password (only testowner, owner & collaborators)

### Stuff

- Password: `sha256('password').digest('base64')` is the password that's to be sent to the server
- create share link: `sha256(linkHash + passwordHash)`, also is the encryption key
- use share link: link gets checked if `linkHash` is correct, then used to decrypt


# TODO

1. use `return Promise.reject(Error)` everywhere instead of `return Error`
2. use Promise with validation
3. test all routes
