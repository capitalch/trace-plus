import { CompTabs, CompTabsType } from "./comp-tabs";

export function TabExample() {
    const tabsData: CompTabsType = [
        {
            label: 'tab1',
            content: <div>Content1</div>
        },
        {
            label: 'tab2',
            content: <div>Content2</div>
        }
    ]
    return (<CompTabs tabsInfo={tabsData} className="m-4" />)
}