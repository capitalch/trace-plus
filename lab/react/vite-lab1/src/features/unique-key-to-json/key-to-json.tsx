export function KeyToJson() {
    return (<div>
        <button onClick={handleClick} className="m-2 bg-slate-200 px-2 py-1 rounded-md">Add key to json</button>
    </div>)

    function handleClick() {
        const res = addKeysToJson(data1)
        console.log(res)
        if (data2?.[0]?.jsonResult) {
            data2[0].jsonResult = addKeysToJsonParentKeySame(data2[0].jsonResult)
        }
        // const res1 = addKeysToJsonParentKeySame(data2)
        console.log(JSON.stringify(data2))
    }

    function addKeysToJson(data: any) {
        let runningKey = 1;

        const traverseAndAddKeys = (node: any) => {
            // Add a unique key to the current node
            const nodeWithKey = { ...node, key: runningKey++ };

            // Traverse through child nodes if present
            Object.keys(nodeWithKey).forEach((key) => {
                if (Array.isArray(nodeWithKey[key])) {
                    nodeWithKey[key] = nodeWithKey[key].map((child: any) => traverseAndAddKeys(child));
                } else if (typeof nodeWithKey[key] === 'object' && nodeWithKey[key] !== null) {
                    nodeWithKey[key] = traverseAndAddKeys(nodeWithKey[key]);
                }
            });

            return nodeWithKey;
        }
        return data.map((item: any) => traverseAndAddKeys(item));
    }

    function addKeysToJsonParentKeySame(data: any) {
        let runningKey = 99999;

        const traverseAndAddKeys = (node: any, parentKey: number) => {
            // Add a running key to child nodes, but the parent keeps the same key
            const nodeWithKey = { ...node, pkey: parentKey };

            // Traverse through child nodes if present
            Object.keys(nodeWithKey).forEach((key) => {
                if (Array.isArray(nodeWithKey[key])) {
                    // Children will have unique running keys
                    nodeWithKey[key] = nodeWithKey[key].map((child: any) => traverseAndAddKeys(child, runningKey++));
                } else if (typeof nodeWithKey[key] === 'object' && nodeWithKey[key] !== null) {
                    nodeWithKey[key] = traverseAndAddKeys(nodeWithKey[key], runningKey++);
                }
            });

            return nodeWithKey;
        };

        return data.map((item: any, index: number) => {
            // Assign a consistent parent key based on index or some stable property
            const parentKey = index + 1; // Can also be item.id if available
            return traverseAndAddKeys(item, parentKey);
        });

    }
}

const data1 = [{ "code": "buu1", "name": "Business unit 1", "buId": 42, "users": [{ "id": 22, "code": "user1", "name": "user1", "buId": 42, "userId": 62 }, { "id": 23, "code": "user2", "name": "user2", "buId": 42, "userId": 63 }, { "id": 24, "code": "user3", "name": "user3", "buId": 42, "userId": 64 }, { "id": 25, "code": "user4", "name": "user4", "buId": 42, "userId": 65 }, { "id": 42, "code": "capital", "name": "Sushant1", "buId": 42, "userId": 56 }, { "id": 43, "code": "user5", "name": "user5", "buId": 42, "userId": 66 }, { "id": 44, "code": "user6", "name": "user6", "buId": 42, "userId": 67 }, { "id": 45, "code": "bFJ1cq6i", "name": "user7", "buId": 42, "userId": 69 }] }, { "code": "buu2", "name": "Business unit 2", "buId": 43, "users": [{ "id": 29, "code": "user5", "name": "user5", "buId": 43, "userId": 66 }, { "id": 30, "code": "user6", "name": "user6", "buId": 43, "userId": 67 }, { "id": 31, "code": "user1", "name": "user1", "buId": 43, "userId": 62 }] }, { "code": "buu3", "name": "Business unit 3", "buId": 44, "users": [{ "id": 32, "code": "user1", "name": "user1", "buId": 44, "userId": 62 }, { "id": 33, "code": "user2", "name": "user2", "buId": 44, "userId": 63 }, { "id": 34, "code": "user3", "name": "user3", "buId": 44, "userId": 64 }, { "id": 35, "code": "user4", "name": "user4", "buId": 44, "userId": 65 }, { "id": 36, "code": "user6", "name": "user6", "buId": 44, "userId": 67 }] }, { "code": "buu4", "name": "Business unit 4", "buId": 45, "users": [{ "id": 37, "code": "user6", "name": "user6", "buId": 45, "userId": 67 }, { "id": 38, "code": "user5", "name": "user5", "buId": 45, "userId": 66 }, { "id": 39, "code": "user4", "name": "user4", "buId": 45, "userId": 65 }, { "id": 40, "code": "user3", "name": "user3", "buId": 45, "userId": 64 }, { "id": 41, "code": "user2", "name": "user2", "buId": 45, "userId": 63 }] }, { "code": "buu5", "name": "Business unit 5", "buId": 46, "users": null }, { "code": "buu6", "name": "busi 6", "buId": 54, "users": null }]
const data2 = [
    {
        "jsonResult": [
            {
                "name": "Default accountant",
                "descr": "Only accountant level rights are available",
                "roleId": 34,
                "securedControls": [
                    {
                        "id": 508,
                        "name": "debit-note-delete",
                        "descr": "Can delete debit note",
                        "roleId": 34,
                        "securedControlId": 106
                    },
                    {
                        "id": 507,
                        "name": "credit-note-save",
                        "descr": "Can save credit note",
                        "roleId": 34,
                        "securedControlId": 143
                    }
                ]
            },
            {
                "name": "Default manager",
                "descr": "All rights available",
                "roleId": 26,
                "securedControls": [
                    {
                        "id": 510,
                        "name": "debit-note-edit",
                        "descr": "Can edit debit note",
                        "roleId": 26,
                        "securedControlId": 15
                    },
                    {
                        "id": 509,
                        "name": "credit-note-edit",
                        "descr": "Can edit credit note",
                        "roleId": 26,
                        "securedControlId": 18
                    }
                ]
            },
            {
                "name": "Default sales person",
                "descr": "Sales level rights are available",
                "roleId": 35,
                "securedControls": [
                    {
                        "id": 512,
                        "name": "journal-delete",
                        "descr": "Can delete journal",
                        "roleId": 35,
                        "securedControlId": 13
                    },
                    {
                        "id": 511,
                        "name": "debit-note-save",
                        "descr": "Can save debit note",
                        "roleId": 35,
                        "securedControlId": 14
                    }
                ]
            },
            {
                "name": "Default user",
                "descr": "Only can view certain data",
                "roleId": 36,
                "securedControls": [
                    {
                        "id": 514,
                        "name": "journal-save",
                        "descr": "Can save journal",
                        "roleId": 36,
                        "securedControlId": 11
                    },
                    {
                        "id": 513,
                        "name": "journal-edit",
                        "descr": "Can edit journal",
                        "roleId": 36,
                        "securedControlId": 12
                    }
                ]
            }
        ]
    }
]