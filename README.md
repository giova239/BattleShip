# BattleShip

[Documentation](https://github.com/giova239/BattleShip/blob/main/Giovanni_Stevanato_880077.pdf)

## To run the web application:

### install the required modules
```
cd client
npm install
cd ../server
npm install
```
>inside both the *client* and the *server* folders

### setup jwt secret
```
echo "JWT_SECRET=secret" > ".env"
```
>Creates a file ".env" to store the JWT secret

### setup mongoDB local server

>To develop the application I used a local mongoDB server hosted on localhost:27017 the Database must be called 'BattleshipDB', it is suggested to download MongoDB Compass as well https://www.mongodb.com/try/download/compass

### finally run the entire application!
> open 2 terminals and run the client in one and the server in the other.
```
cd client
npm start
```
```
cd server
npm start
```
## The website will be up and running on http://localhost:4200/
