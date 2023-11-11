## Redux steps
# Step 1: Create store
# Step 2: Create slice and export reducer and actions
- One slice has multiple actions
# Step 3: Assign reducer to store
# Step 4: Create Provider at index.tsx and set the store
# Step 5: use actions
- In components make use of useSelectors and dispath

## Typescript tailwind
- With typescript the tailwind.config.js file must have: content: [{html,js,jsx,ts,tsx}]
- Headwind for class sorting: On save the sorting takes place. To disable this
	- Click settings icon -> extension settings -> disable run on save 
	- You can use ctrl + alt + T to do sorting
- To enable tailwind intellisense in variables
	- In Tailwind intellisense extension settings -> **Tailwind CSS: Class Attributes** add .*Class and .*Styles. Now all variables with aClass or bStyles will have intellisense
	- Also you can directly modify .vscode.settings.json file as adding  ".*Styles", ".*Class" in it
- The transition does not work with h-max, h-auto. For transition to work the height should be fixed like h-4, h-8 etc.

## CSS
- Position
	- static: default
	- relative
		- Element is placed as per helper properties like top, left, bottom, right. Position of other elements is not altered.
		- the values of top,left, right etc. are with respect of the original position of element and not with repect of viewport
		- The other elements think as if this element still holds its original space. Other elements retain their place as if nothing has happened
	- absolute
		- Element is positioned with relative to parent element and not with relative to its original would be position
		- If we don't specify top, left etc. then element is positioned as top left of parent
		- Remember that in **relative** the element is positioned w.r.o its original position. In **absolute** element is positioned w.r.o parent element
		- Space occupied by this element is released
		- Other elements think that this element does not exist. This element is removed from normal document flow
	- fixed
		- Element is removed from normal document flow
		- Other elements think that this element does not exist
		- Element is positioned as w.r.o viewport
	- sticky
		- position:sticky can be explained as a mixture of position:relative and position:fixed. 
		- At declaration, it acts like position:relative, but when scrolling, it acts like position:fixed.
		- A sticky element toggles between relative and fixed, depending on the position of the scroll. 
		- It is relative until an offset position is met in the viewport
## Eslint
- Error "require is not defined" when adding a plugin in vite tailwind project
	- in file .eslintrc.cjs
		  {
		  "env": {
		    "amd": true
		  }
		}
		- 

## Signals from @preact/signals-react
```
const SignalsStore: SignalsStoreType = {
    main: {
        count: signal(0)
    }
}
```
- If you use SignalStore.main.count.value for display then component will refresh on change of data
- If you use SignalStore.main.count to show the text in a componentcontrol then on change of data the component will not refresh. Updated data will show up. This is a better way
	- <label>Count: {SignalsStore.main.count}</label> // Will not refresh
	- <label>Count: {SignalsStore.main.count.value}</label> // will refresh

- If some computed data is being used this will do **component reload**. For computed data use the computed function. Then reload will not happen
	- <label>Computed: {computed(() => SignalsStore.main.count.value * 4)}</label>

- For subscription or sending arbitrary data from one component to another component use the **effect** functon. This a better replacement of **Ibuki**
	- effect(
        () => {
            console.log(SignalsStore.main.count.value)
        }
    )