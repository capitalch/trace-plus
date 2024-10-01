## GraphQL Apollo
- We are only using GraphQL Apollo for query and not using react-query
- Create apollo client and get the apolloClient instance through exported getApolloClient() method in app/graphql folder
- In main.tsx make use of ApolloProvider and set client. useQuery hook is provided by Apollo GraphQL
- We have created a useQueryHelper hook upon useQuery hook, with parameters as db name, instance, queryArgs, isExecQueryOnLoad
- Make use of useQuery hook for running GraphQL query at component load when required
- Make use of useLazyQuery hook if you want to run the query on some event like button click event
- Graphql maintains an internal cache. The reload of a component only occurs when the newly loaded data is different than existing cache.
- Use refetch() method got from useQuery() hook to fetch the data on button click. The component will reload only when the fetched data is deifferent than internal cache. Otherwise the api call will be made but component will not refresh
- In useQuery hook pass {notifyOnNetworkStatusChange: true} options for each time rerender of component when a query is made. Otherwise rerender of component will only happen when query result is changed

## QueryHelper: Is used for data fetch all over
	- Uses Apollo Client's useLazyQuery for flexiblity
	- Provides a generic data access layer used all over
	- Returns 'loadData' method and 'loading'
	- Parameter isExecQueryOnLoad is by default true. So query is executed on load by default
	- One of Input parameters is 'instance'. Using redux sets the data to state.queryHelper.[instance]
	- Fetched data is available in component by using selector as:
			useSelector((state: RootStateType) => {
		        return (state.queryHelper[instance]?.data)
		    })
	- Takes care of normal error and graphQL errors automatically
## Important Notes
- Use CompContentContainer as outermost container for all pages
- instance for the syncfusionGrid is same as instance for data
- For forms, the react-hook-form is used
- For all queries the queryHelper is used
- for mutation Utils.mutateGraphQL is used
- React-hook-form
	- If you do setError() to set error for a field, this error will not be persisted once associated rules for the control are validated
	- If you want onChange event in the control, you cannot use onChange event in normal manner. You need to put onChangeevent in the registerField method as below:
		const registerClientCode = register('clientCode'
        , {
            required: Messages.errRequired,
            validate: {
                noSpaceOrSpecialChar: checkNoSpaceOrSpecialChar,
            },
            onChange: (e: any) => {
                ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-CLIENT-CODE'], { clientCode: e.target.value })
            }
        }

## How to use Global context
- const context: GlobalContextType = useContext(GlobalContext)
- In global-context.tsx set the property for intellisence
- context.[property] = value
## Redux steps
# Step 1: Create store
# Step 2: Create Provider at index.tsx and set the store in provider
# Step 3: Create slice and export reducer and actions
- One slice has multiple actions but one reducer
# Step 4: Assign reducer to store. 
	- Likewise you can create many slices and each slice has corresponding reducer
	- In store write all the reducers
# Step 5: use actions
- In components make use of useSelectors and dispath
- In dispatch make use of actions

## TypeScript with redux
# Step 1: In store.ts include types AppDispatchType, RootStateType
	export type RootStateType = ReturnType<typeof store.getState>
	export type AppDispatchType = typeof store.dispatch
# Step 2: In counterSlice.ts include types for actions and initialstate
	type DoIncrementType = {
	    step: number
	}

	type DoDecrementType = {
	    step: number
	}

	type InitialStateType = {
    	count: number
	}
# Step 3: In counterSlice.ts  inside reducers provide action type
	reducers: {

        doIncrement: (state: InitialStateType, action: PayloadAction<DoIncrementType>) => {
            const step = action.payload.step
            state.count = state.count + step
        },
        doDecrement: (state: InitialStateType, action: PayloadAction<DoDecrementType>) => {
            const step = action.payload.step
            state.count = state.count - step
        }
    }

# Step 4: in Counter.tsx make use of dispatch and useSelector as follows. You will get intellisence
	const dispatch: AppDispatchType = useDispatch()
    const count = useSelector((state: RootStateType) => {
        const count = state.counter.count
        return (count)
    })

    function handleIncrement() {
        dispatch(doIncrement({step:1}))
        
    }

    function handleDecrement() {
        dispatch(doDecrement({step:1}))
    }

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