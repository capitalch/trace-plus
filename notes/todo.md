## To do
																				- While logging get roleId and roleName also as loginInfo
- validations
	- Test case
		- Create a new business user with client_id 51
		- Try to change its uid to capital
			- there should server validation error
		- Try to change its uid to capital1
			- it should be OK
																			- Admin users
																				- Business users: Server side validations
																					- While create / edit email check that same clientID + email is unique
																					- Make use of coalesce for edit
																				- Change uid
																					- make sure that new clientID + uid is unique
																					- use coalesce for edit

																				- Display user email on screen after login
- Provide appropriate logging at server
																				- Apply client side validations prior to server side validations in Super admin
																					- handle clientid axios error in login screen when server is not running
																				- Change uid
																					- Ui
																					- current uid and uid cannot be same
																					- verify current UID at server
																					- Email from server
																				- Change pwd
																					- Logic
																						- UI Forgot password popup with email input
																						- Hits at unsecured url forgot-password
																							- Verify email from UserM table
																								- If email exists: Send mail with url encoded with email JWT tken for 30 mins
																									- Message: Check you mail for reset link
																								- Else raise error: Email does not exist
																					- Detailed logic
																						- User requests a password reset by entering their email in the frontend.
																						- Frontend sends a request to the backend with the user's email.
																						- Backend validates the email, generates a secure token, and sends an email to the user with a password reset link (containing the token).
																						- User clicks the link and is redirected to a password reset page.
																						- User enters a new password on this page, which is sent to the backend along with the token.
																						- Backend verifies the token, updates the password, and returns a success message.
																					- Ui and client side code
																					- current pwd and pwd cannot be same
																					- Email from server
																					- Login menu
																						- From super admin remove Change password and change uid
- Admin
																					- Correct some of naming conventions for client and server
																					- Sometimes top navbar menu has different side menu
																					- When top menu changes then do clean up and make the screen blank
																						- Dashboard
	- Business units
		- New
																						- View
																						- Edit
																						- Delete
																							- After delete the data is not getting refreshed
		- Server side create BU
																						- Roles
																						- Business users
- Business user
	- Vouchers
	- Purch / Sales
	- Masters
	- Final accounts
	- Options
	- Reports
	- Inventory
																						- Login to use client id concept
																							- Typeahead implement
																							- Axios query post
																							- UI
																							- client logic
																							- server logic
																						- Check if no of rows is passed as arg from client
																					- Admin users
																							- View
																						- Add
																							- server check user email
																						- edit
																						- Delete
																						- Save
																							- custom logic for server
																					- Secured controls
																							- View
																							- Add
																							- edit
																							- Delete

																					- Roles
																							- Grid view
																							- edit
																							- delete
																							- new
																							- grid header
																						- Delete
																							- Server
																								- Graphql genericUpdate
																							- Client
																								- map Graphql
- UI correction: Label Super admin user. Horizontal scrollbar should not come
																								- External DB

## Relearn
											- Basic fastapi server
											- Integrate middleware and exceptions
											- Custom Exception handling
											- Integrate GraphQL
											- Connect client graphQL, get basic data
											- Exception with GraphQL
											- DB data from graphQL
											- middleware approach with token

## To do
																								- Rename all reducers withour R ending

																								- Provide fields in form with validations
																								- Test database connection
																							- submit
																								- Client side
																								- Server side code
																								- Create database DML at server
																							- Authentication
																								- Token at client
																								- Token management at server
																							- edit mode
																								- decoding dbparams
- delete
																								- DB port validation
																								- url validation correction
																								- remove preview
																							- server code

- Login error handling not correct
																								- Form for new client has error in isActive field
																								- Grid Text prompt on edit, preview and delete
																								- Server validation for clientCode for unique clientCode
																								- Server validation for clientName for unique clientName

																								- Close form after success
																								- Reload data aftersuccess save
																								- Edit row data

																								- GraphQL mutation at server side
																								- Independent Loading indicator
																							- Grid
																								- Create UI for status bar
																								- Status bar align with container
																								- pdf and excel export
	- Search
		- Multiple keyword search
																								- retain searchString in Redux
																								- On Refresh execute the search also
																								- Two buttons
																								- Edit, Delete and Preview
																								- Tooltip widget
																								- load data
																								- last no of rows
																								- Grid instance
																								- Redux with grid
																								- Grid query make work
																								- Columns
																									- client id, clientCode, client name, db name, extdb, active
																								- Error handling
																								- Make use of SqlIds instead of direct id
																								- Aggregates
																								- Refresh icon placement in middle of screen
																								- Data fetch and refetch finalize
																							## GraphQL
																							- store hostUrl in Global context
																							- implement GraphQL with token
## Super Admin
																								- Upgrade the server with latest libs
- Brief learning of GraphQL client and server
- lab
	- Syncfusion grid
	- form validation with ...
	- Data retrieval: React query
	- GraphQL client
	- React query with GraphQL
- implement node.env
- implement react query and graphql in login
- Set graphQL framework at client side and server side

- Super admin UI
	- Dashboard
		- Connections	: Active, Idle, Total
		- Clients		: Active, Inactive, Total
		- Admin users	: Active, Inactive, Total


		- Client details: Grid with columns
			- index, client code, client name, BU's, All users, Roles, Is active
## Bugs
																								- When login the drop down menu is open automatically
																								- Show the user type logged in
## trace-plus
- Server login
																								- Create token
	- Change password
	- Change uid
																								- Top navigation bar
																								- log out
																								- drop down menu
																								- Change uid screen
																								- Change password screen
																								- Side bar
																									- Side menu
																									- Consider highlighting the text instead of background when selecting or hovering a menu item
																									- Not to show Up / Down arrow when there are no children
																									- Provision for color in the masterMenuData
																									- Navigation in children
																									- Navigation in parents when there are no children
		- Transition when drop down in menu items
																									- When no children then parent should be selectable and its color would change
																									- When change menu item in navbar then all parents should be made unexpanded or reset

																									- Check fastAPI error handling. It's not proper at present for superAdmin
																									- SweetAlert2 for error handling
																									- Revisit routing, protected and outlet
## New project with redux-toolkit
																									- Vite setup
																										- npm start
																										- port 3000
- Router setup
																									- Tailwind setup
- Redux toolkit
- Icons
																									- Folder structure
- Navigation
	- Login
	- Layouts
	- top bar
	- drop downs
## Recap
# Client side
- React router
- Signals: value, effect, computed
- React hook form
- 
## To do for authentication
- Configure Logger at server
- Login screen at client
- login endpoint at server
- verifyToken endpoint at server
- createAccessToken at server
- Implement GraphQL api and secure it
- implement forgot password
- Mechanism to keep token at localstorage
- Complete the flow
## Implementation To Do
# Server
- Authentication
- GraphQL implementation
- Exception management

# Client
- FastAPI framework
- Exception management
- React query

# Documentation
- jekyll

## Research to do
- Documentation using jekyll
- Fastapi authentication
- psycopg, psycopg2


## To do on 19-11-2023
- GraphQL premier 
- Implementation in the project
- Jekyll documentation merge

## Server side implementation

																			- messages
																			- Project container
																			- Hello world
																			- Corcr
																			- Exception handling
																			- Querystring
																			- path
																			- body
																			- header
																			- response and status code
																			- dependencies
																			- corcs
																			- middlewares
																			- Request body
																			- Header parameters
																			- Response Model
																			- Response status code
																			- Handling errors

																			- Python annotations and typing
																			- pydentic
																			- apiRouter and routing
																			- understanding __init__.py
- psycopg, psyopg2 etc.

- jekyll in github. Documentation
			
## Client side
- react query
- Redux
- GraphQL
- Implement authentication at client side
- Server side authentication work update
- Integrate client and server for authentication
- Implement drawer for mobile devices

																			## Modal to do
																			- Accommodate parameters in modal
																			- Navbar put modalA
																			- call from sources uid and password

																			- Close button color
																			- implment top right close
																			- body proper implementation

																			## Design to do																			
																			- Naming convention etc for navigation
																			- Implement routes separately
																			- Implement admin menu
																			- Implement super admin menu
																			- Transitions and animations

																			- implement Change uid, change password

																			- Generic side menu
																			- Navbar height increase
																			- Redo primary, secondary, tertialy as per teams
																			- Remove underline	
																			- Mechanism to show hierarchical menu in sidebar
																			- Separate out Navbar and SideBar as independent components
																			- Implement logout in SignalsStore
																			- Implement temporary login as Super admin, admin, business user
																			- Show footer in sidebar as user type
																			- Navbar: Right side dropdown menu: 
																			- If SuperAdmin then LogOut. If Admin / Bus user then change UID, change password
																			- button color, User icon, down icon
	
																			- implement logout
																			- Do implementation as children
																			- Make necessary changes for different types of users
																			- Navbar: 
																				- If superAdmin: Show Administration | Highlight it and set sidebarMenu in SignalsStore as super admin menu values
																					- Show menu items in sidebar against super admin
																				- If admin: Show Accounts, Administration | Highlight Accounts and set sidebarMenu in SignalsStore as admin accounts menu values. On click of Administration highlight it and push corresponding value in SignalsStore, so that it gets displayed in sidebarMenu
																				- If Bus user: Show Accounts and push accounts menu values
		
																			- Check showing components inside the Content control using Outlet of react router
																			- Implement login / layouts
																			- Size and margins of Nav, sideBar and content based on 2XL size
																			- Design of sideBar with top header showing left slide icon button
																			- After menu slide or slideMenu click, the nav should show menu button visible and menu should close


## Research
																			- Tailwind start
																			- Redux implementation and strategy
																			- Redux based modal window in tailwind: @headlessui/react
- Context API
																			- React routers
																			- html tags
																			- Responsive
																			- Typography plugin
