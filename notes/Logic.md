## Client side side menu
- In SideMenu.tsx find current menuItem from redux selector and get corresponding menu data from master-menu-data.ts
- 

## **Authentication mechanism**
- isLogin is false by default, so login screen is displayed; Otherwise based on type of user, the menu screen will be displayed
- Login screen submit button sends username and password to server /login endpoint
- At fastApi /login endpoint, request is send to **OAuth2PasswordRequestForm** fastapi method; It just provides out username and password as "formdata". The "formdata" is used to create bundle for SuperAdmin(S) or Admin(A) or business user(B). Bundle is sent to client along with accessToken JWT generated
- We do not generate refresh token for simplicity and more security. This will enable frequent login
- Client sets isLogin true and sets accessToken in SignalsStore
- Now due to refresh nature of SignalsStore the menu screen is shown based on logged in user type for SuperAdmin(S), Admin(A), Business user(B)
- At client every request to GraphQL api is secured and accessToken is auto inserted in header as Bearer
- At server whenever a secured request is made authentication of token is required. So every such request is passed through is_valid_token method
- We also create an endpoint verifyToken which uses **OAuth2PasswordBearer** of graphql which plucks out the token from header. This is a shortcut way, otherwise few lines of code will be needed to take out the JWT token. This endpoint is not used for authentication flow but is used to verify a token through fastapi auto generated documentation
- accessToken is segregated and checked. If no token found or token expired then 401 error is sent to client
- When client sees 401 error it sets isLogin to false and logs out. We could have used refreshToken over here to create the new accessToken at server, but at present it is not required
- Now the login screen automatically displays
- We will use localstorage to store the accesstoken. So if the token is not expired then on hard page refresh(F5) the state of software will be maintained
- It is advisable to keep the life of accessToken as 10 hours