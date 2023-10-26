## Typescript tailwind
- With typescript the tailwind.config.js file must have: content: [{html,js,jsx,ts,tsx}]

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