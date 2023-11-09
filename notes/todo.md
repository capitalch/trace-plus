- Implement drawer for mobile devices
- Server side authentication work update
- Implement authentication at client side
- implement Redux

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
