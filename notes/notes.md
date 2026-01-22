## flutter versionising
- dart pub add --dev cider

# Increment build number
cider bump build
say: orig ver is 1.0.0+1
dart run cider bump major //2.0.0+1
dart run cider bump minor //1.1.0+1
dart run cider bump patch //1.0.1+1
dart run cider bump build //1.0.0+2

# Git
git branch              # List branches
git checkout -b new     # Create/switch to branch
git merge branchname    # Merge branch into current

## merge
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes from remote
git pull origin main

# 3. Merge your feature branch into main
git merge upgrade-syncfusion

# 4. Push the merged changes to remote
git push origin main

# 5. Delete local branch
git branch -d upgrade-syncfusion

# 6. Delete remote branch
git push origin --delete upgrade-syncfusion

- Screen sizes
sm: 640px and up
md: 768px and up
lg: 1024px and up
xl: 1280px and up
2xl: 1536px and up
																									## Bug
																									- Stock reports problem
																									- Stock transaction report not working
																									## Bugs
																									- Purchase entry then sales then back to purchase entry shows product of sales
																									- Purchase price variation report error
																									- Stock transactions op balance error
																									- Sales report does not show sales return
# library to add
	react-sliding-pane
## New features to include
- Include TAN No and Pan No
- Include branch address and GST No in Branch
- Same party ref-no should be unique
- Inter branch transfer
- Branches same bank account provision

- No duplicate entries should be achievable in purchase
																									- Print preview of purchase invoice
- Salesperson management descriptive
- Audit feature
- User management at branch level
- Multiple mobile number not available print preview
- Print bill at different location
- E Bill and GST integration
- Subtitle provision in sale bill
- Product price lock for sales
- Product merge
- Back / forward to see last next entries
- Voucher delete control
- TCS entry
- Purchase sale rewind
- Machine info against entry
- Sales return would notify the original invoice that it is returned
## fastapi with async psycopg connection pool
https://medium.com/@benshearlaw/asynchronous-postgres-with-python-fastapi-and-psycopg-3-fafa5faa2c08

## syncfusion key for 25.x
ORg4AjUWIQA/Gnt2UFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTX5XdkBjXntZdXNTT2Vb

## pip install pydantic fastapi uvicorn[standard] typing ariadne bcrypt pyjwt[crypto] psycopg[binary,pool] python-multipart fpdf xlsxwriter fastapi_mail pandas cryptography
- superadmin@123

## VSCode extensions
- Tailwind CSS Intellisense
- HeadWind: class sorter: Works great

## React icons svg
https://reactsvgicons.com/react-svg-iconsets

## lucid react icons
https://lucide.dev/icons/

## Tailwind 
- CheatSheet
	- Tailwind Cheat Sheet by NerdCave: https://nerdcave.com/tailwind-cheat-sheet
	- Tailwindcss cheatsheet by umeshmek: https://umeshmk.github.io/Tailwindcss-cheatsheet/
- Many Items together
	- https://github.com/aniftyco/awesome-tailwindcss
- Icons svg
	- https://reactsvgicons.com/react-svg-iconsets
- Modals
	
## UI libraries to use
- tailwind
	- Good library from base implementations of controls
		- https://www.creative-tim.com/learning-lab/tailwind-starter-kit

## Free timer app
https://apps.microsoft.com/detail/free-timer-app/9NK6ZKX5TV0G?hl=en-US&gl=US
	

## UI libraries may consider
- Some good ones
	- chart.js
		https://www.chartjs.org
	- tippy.js: tooltips, popovers, dropdowns
		https://atomiks.github.io/tippyjs
	- vivus: Create stunning, animated SVG drawings with Vivus
		https://maxwellito.github.io/vivus
	- 
- rsuitejs
- headlessui: considering
- daisyUI for tw
- tw-elements
- flowbite datepicker
- for layouts: https://layoutsfortailwind.lalokalabs.dev/
- Sira: https://www.sira-design.party/
- RippleUI: good: https://www.ripple-ui.com/
- Basic Tailwind component classes. Must use. https://sailboatui.com/docs/forms/input/
- Basic Tailwind component classes: https://uiverse.io/
- Very good. From basic classes: https://preline.co/docs/modal.html

- Good color generator: https://www.tints.dev/
		- Good: https://uicolors.app/create
		- Buttons examples: https://tailwindflex.com/tag/button
		- Some more buttons: https://ordinarycoders.com/blog/article/7-tailwindcss-buttons

## Meeting with Manju Bhabhi
- Two Bu: Madyam, CapitalRajar
	Mad: Sodpur, Behala branch
	CapiRaj: Only one branch
	AOSmith in Sales item search not coming correctly.
- Behala bill showing in Sodepur: 142, 22
- Sale bill 521: Sodepur was showing twice. Now not visible. Check if deleted
