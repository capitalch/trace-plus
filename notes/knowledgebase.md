## Typescript tailwind
- With typescript the tailwind.config.js file must have: content: [{html,js,jsx,ts,tsx}]
- Headwind for class sorting: On save the sorting takes place. To disable this
	- Click settings icon -> extension settings -> disable run on save 
	- You can use ctrl + alt + T to do sorting
- To enable tailwind intellisense in variables
	- In Tailwind intellisense extension settings -> **Tailwind CSS: Class Attributes** add .*Class and .*Styles. Now all variables with aClass or bStyles will have intellisense
	- Also you can directly modify .vscode.settings.json file as adding  ".*Styles", ".*Class" in it
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